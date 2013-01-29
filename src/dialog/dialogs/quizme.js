/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at http://www.mozillapopcorn.org/butter-license.txt */

define([ "text!dialog/dialogs/quizme.html", "dialog/dialog", "util/xhr" ],
  function( LAYOUT_SRC, Dialog, XHR ){

  Dialog.register( "quizme", LAYOUT_SRC, function( dialog ) {

    var rootElement = dialog.rootElement,
        title       = rootElement.querySelector( ".title" ),
        quizzes     = rootElement.querySelector( ".quizzes" ),
        addQuiz     = rootElement.querySelector( ".addQz" ),
        delQuiz     = rootElement.querySelector( ".delQz" ),
        questions   = rootElement.querySelector( ".questions" ),
        addQuestion = rootElement.querySelector( ".addQ" ),
        thisform    = rootElement.querySelector( ".addQuestions" ),
        selectQ     = rootElement.querySelector( ".selectQ" ),        
        addAns0     = rootElement.querySelector( ".addAns0" ),
        addAns1     = rootElement.querySelector( ".addAns1" ),
        okQ         = rootElement.querySelector( ".okQ" ),
        delQuestion = rootElement.querySelector( ".delQ" ),
        
        inputs      = thisform.getElementsByTagName("input"),
        GlobalQuiz  = new Object(),
        GlobalDataQuiz  = new Object();

    
    //*** BD Quiz ***//

    getquizzesQuizDB = function (id, callback) {
        if (id === undefined) { id = "" }
        XHR.get("/api/quizzes/" + id, callback);
    }

    updatequizQuizDB = function (id, name, data, callback) {
        if (name === undefined) { return }
        if (id === undefined) { return }
        if (data === undefined) { data = {} }
        var quiz = {
            id: id,
            name: name,
            data: data.quiz,
            options: "",
            type: data.type
        }
        var sdata = JSON.stringify( quiz, null, 4 );
        XHR.post("/api/updatequiz", sdata, callback, "application/json");
    }

    deleteQuestionsQuizDB = function (id, callback) {
        var pid = { id: id };
        var data = JSON.stringify( pid, null, 4 );
        XHR.post( "/api/deletequiz", data, callback, "application/json" );
    }

    addquizQuizDB = function (name, data, callback) {
        if (data === undefined) { data = {} }
        var quiz = {
            id: null,
            name: name,
            data: data,
            options: null,
        }
        var sdata = JSON.stringify( quiz, null, 4 );
        XHR.post( "/api/savequiz", sdata, callback, "application/json" );
    }


    //*** CLEANERS ***//
        
    function stripBlanks(fld) {
        var result = "";
        var c = 0;
        for (var i=0; i < fld.length; i++) {
            if (fld.charAt(i) != " " || c > 0) {
                result += fld.charAt(i);
                if (fld.charAt(i) != " ") {
                    c = result.length;
                }
            }
        }
        return result.substr(0,c);
    }
    
    cleanFormQuestions = function () {
        thisform.getElementsByTagName("textarea")[0].value = '';
        for (var i=0; i<inputs.length; i++) {
            if (inputs[i].type == "text" && inputs[i].name != "atf") {
                inputs[i].value = "";
            }
            else if (inputs[i].type == "radio") {
                inputs[i].checked = false;
            }
        }
    }
    
    cleanArray = function (array) {
        var aux = [];
        for (var i=0; i<array.length; i++) {
            if (array[i] !== undefined || array[i] !== null) {
                if (array[i].length > 0) {
                    aux[aux.length] = array[i];
                }
            }
        }
        return aux;
    }
    
    cleanList = function (obj) {
        obj.innerHTML = "";  // remove all select list options
    }


    // Choose The type of select option: Multilist, TrueFalse, Fill, List, Cards.
    onSelectQ = function(select) {
        if (typeof(select) != 'undefined') {
            for (var i=0; i<selectQ.options.length; i++) {
                if ( selectQ.options[i].id == select) {
                    selectQ.selectedIndex = i;  // set type on list select option
                    break;
                }
            }
        }
        var trs   = thisform.getElementsByTagName("tr");
        var typeQ = selectQ.options[selectQ.selectedIndex].id;
        if (typeQ == "cards") {
            typeQ = "fill";
        }
        else if (typeQ == "multi") {
            typeQ = "multiList";
        }
        for (var i=0; i<trs.length; i++) {
            if ( trs[i].id == typeQ) {
                trs[i].style.display = "table-row";
            }
            else if (trs[i].id != typeQ && trs[i].id != "addQuestions") {
                trs[i].style.display = "none";
            }
        }
    }
    
    // Add a new text-row answer for a multilist quiz
    addRow = function () {
        var trs = thisform.getElementsByTagName("tr");
        for (var i=0; i<trs.length; i++) {
            if (trs[i].id == "hidden") {
                trs[i-1].getElementsByTagName("input")[2].style.display = "none";
                trs[i].style.display = "table-row";
                trs[i].id = "multiList";
                break;
            }
        }
    }
    
   
    // When it clicks "Update Question" or "Create Question" 
    okQ.addEventListener( "click", function () {
        
        var question = stripBlanks(thisform.getElementsByTagName("textarea")[0].value);
        var typeQ = selectQ.options[selectQ.selectedIndex].id;
        
        if (question == '') {  // alert("You must enter a question");
            thisform.getElementsByTagName("textarea")[0].focus();
            return false;
        }
        
        // Search inputs from Multilist, TrueFalse, Fill Quiz
        // by Default -> Multilist ("c", "a")
        var searchC = "c"; // search Combo Box
        var searchA = "a"; // search Input Answers
        if (typeQ == "tf") {
            searchC = "ctf";
            searchA = "atf";
        }
        
        if (typeQ == "fill" || typeQ == "cards") {
            var c = []; // Create Array C (include radio box)
            var anscorrect = 0; //num ans correct
            
            var a = []; // Create Array C (include radio box)
            var ax = [];
            for (k=0; k<inputs.length; k++ ) {
                try {
                    if (inputs[k].name == "f") {  //search "a" or "tf"
                        ax[ax.length] = inputs[k];
                        a[a.length] = stripBlanks(inputs[k].value);
                        break;
                    }
                }
                catch(err) {
                    break;
                }
            }
        }
        else {  // Multilist, multi or TrueFalse
            var c = []; // Create Array C (include radio box)
            for (var i=0; i<inputs.length; i++ ) {
                try {
                    if (inputs[i].name == searchC) {  //Search "c" o "ctf"
                        c[c.length] = inputs[i];
                    } else {
                        continue;
                    }
                }
                catch(err) {
                    break;
                }
            }

            var anscorrect = -1; //num ans correct
            for (var i=0; i<c.length; i++) {
                if (c[i].checked) {
                    anscorrect = i;
                }
            }
            if (anscorrect == -1) {  // alert("You must select a correct answer");
                c[0].focus();
                return false;
            }
            
            var a = [];
            var ax = [];
            for (var k=1; k<inputs.length; k++ ) {
                try {
                    if (inputs[k].name == searchA) {  //search "a" or "atf"
                        ax[ax.length] = inputs[k];
                        a[a.length] = stripBlanks(inputs[k].value);
                    }
                }
                catch(err) {
                    break;
                }
            }
            
            if (a[0] == '') {  // alert("You must enter at least 2 answers");
                ax[0].focus();
                return false;
            }
            if (a[1] == '') {  // alert("You must enter at least 2 answers");
                ax[1].focus();
                return false;
            }
        }

        //Nulo
        for (var i=0; i<a.length; i++) {
            if (anscorrect == i && a[i] == '') {
                ax[i].focus();
                return false
            };
        }

        //Igualdad
        for (var i=1; i<a.length; i++) {
            if (a[i] == '') {
                break;
            }
            for (j=0; j<i; j++) {
                if (a[i] == a[j]) {
                    ax[i].focus();
                    return false;
                }
            }
        }

        if (questions.selectedIndex >= 0) { // It means we just have to update question
            updateQuestionLocal(question, a, anscorrect, typeQ);
        }
        else {  // Create a new one
            cleanFormQuestions();
            storeQuizLocal(quizzes[quizzes.selectedIndex].innerHTML, question, a, anscorrect, typeQ);
        }
        storeQuiz(quizzes[quizzes.selectedIndex].innerHTML, GlobalDataQuiz, typeQ, reloadQuiz);
    }, false );
    
    
            
    storeQz = function (quiz, question, x, anscorrect, typeQ, position) {
        // position means update question of that position
        if (typeof(position) == 'undefined') {
            try {
                position = GlobalQuiz[quiz][typeQ].length;  // create a new question
            }
            catch (err) {
                position = 0;
            }
        }
        var ans = x[anscorrect];
        delete x[anscorrect];
        a = cleanArray(x);
        
        if (typeQ == "tf") {
            ans = ans != "false";
        }
        
        if (typeQ == "multiList" || typeQ == "multi") {
            try {
                GlobalQuiz[quiz][typeQ] [position] = {ques: question, ans: ans, ansSel: a};
            }
            catch (ex){
                GlobalQuiz[quiz][typeQ] = [];
                GlobalQuiz[quiz][typeQ] [position] = {ques: question, ans: ans, ansSel: a};
            }
        }
        else {
            try {
                GlobalQuiz[quiz][typeQ] [position] = {ques: question, ans: ans};
            }
            catch (ex){
                GlobalQuiz[quiz][typeQ] = [];
                GlobalQuiz[quiz][typeQ] [position] = {ques: question, ans: ans};
            }
        }
    }
    
    
    updateQuiz = function (question, a, anscorrect, typeQ) {
        try { // This is awful ;-)
            var info = questions.options[questions.selectedIndex].value.split('|');
        } 
        catch (err){  // It Means we need to add q new question, beacause there are no selected 
            addQ.click();
            return;
        };
        
        var name   = info[0];
        var type   = info[1];
        var n      = info[2];
        
        if (type != typeQ) { // It means we need to delete the question and create a new one
            delete GlobalQuiz[name][type] [n];
            storeQz(quizzes[quizzes.selectedIndex].innerHTML, question, a, anscorrect, typeQ);
            return false;
        }
        else {  // else update question
            storeQz(quizzes[quizzes.selectedIndex].innerHTML, question, a, anscorrect, typeQ, n);
        }
        return true;
    }
    
    editQz = function () {
        cleanFormQuestions();
        
        try { // This is awful ;-)
          var info = questions.options[questions.selectedIndex].value.split('|');
        } 
        catch (err){  // It Means we need to add q new question, because there are no selected 
          addQ.click();
          onSelectQ();  // select option by default
          return;
        };
        okQ.value = "Update Question";
        
        var name   = info[0];
        var type   = info[1];
        var n      = info[2];
        var quiz   = GlobalQuiz[name][type] [n];

        onSelectQ(type);
        
        thisform.getElementsByTagName("textarea")[0].value = quiz.ques; //fix this
        
        if (type == "fill" || type == "cards") {
            for (var k=0; k<inputs.length; k++ ) {
                if (inputs[k].name == "f") {
                    inputs[k].value = quiz.ans;
                    break;
                }
            }
        }
        else if (type == "tf") {
            var pass = false;
            for (var i=0; i<inputs.length; i++ ) {
                if (!pass && inputs[i].type == "radio" && inputs[i].name == "ctf") {
                    inputs[i].checked = true == quiz.ans;
                    pass = true;
                }
                else if (pass && inputs[i].type == "radio" && inputs[i].name == "ctf") {
                    inputs[i].checked = false == quiz.ans;
                    break;
                }
            }
        }
        else {
            var ans = quiz.ansSel.slice();
            for (k=1; k<inputs.length; k++ ) {
                if (inputs[k].name == "a") {
                    if (ans.length > 0) {
                        inputs[k].value = ans.shift();
                        inputs[k+2].value = quiz.ans;
                        inputs[k+1].checked = true;
                    }
                }
            }
        }
    }
        
    loadquizzes = function () {
        cleanList(quizzes);
        for (var name in GlobalQuiz) {
            quizzes[quizzes.length] = new Option(name, quizzes.length);
        }
    }
    
    loadQuestions = function () {
        if (!quizzes[quizzes.selectedIndex]) {
            return false;
        }
        var quiz = quizzes[quizzes.selectedIndex].innerHTML;
        var aux = false;
        cleanList(questions);
            
        for (var name in GlobalQuiz) {
            if (name == quiz) {
                for (var type in GlobalQuiz[name]) {
                    for (var n in GlobalQuiz[name][type]) {
                        aux = true;
                        questions[questions.length] = new Option(GlobalQuiz[name][type][n].ques, [name, type, n].join('|'));
                    }
                }
            }
        }
        return aux;
    }
    
    onChangeQuiz = function (n) {
        if (loadQuestions()) {
            questions.selectedIndex = n || 0;
        }
    }
    
    changeNameQuiz = function(obj, name, newname) {
        if (name != newname) {
            if (obj[newname] === undefined) {
                obj[newname] = obj[name];
                delete obj[name];
                return true;
            }
            return false;
        }
        return false;
    }
    
    nameExist = function (obj, newname) {
        return obj[newname] !== undefined;
    }
    
    
    vanishQuestion = function () {
        if (questions.selectedIndex >= 0) {
          var info = questions.options[questions.selectedIndex].value.split('|');
          var name = info[0];
          var type = info[1];
          var n    = info[2];
          
          delete GlobalQuiz[name][type][n];
          loadQuestions();
          addQ.click();
        }
    }
    
    vanishQuizzes = function () {
        if (quizzes.selectedIndex >= 0) {
          delete GlobalQuiz[quizzes.options[quizzes.selectedIndex].innerHTML];
          loadquizzes();
          cleanList(questions);
          addQ.click();
        }
    }
    
    
    function BD (obj) {  // SOON IT WILL WORK
        this.obj = obj;
        
        this.get = function () {
            return this.obj;
        }
        
        this.store = function (quiz, question, x, anscorrect, typeQ) {
            storeQz(quiz, question, x, anscorrect, typeQ);
        }
        
        this.exist = function (newname) {
            return this.obj [newname] !== undefined;
        }
        
        this.new = function (name) {
            this.obj[name] = new Object();
        }
    }


    // *** Interaction (callbacks) with BD *** //

    print_quizzes = function() {
        if (this.readyState === 4) {
            try {
                var response = JSON.parse(this.response);
                console.log("RESP:: ", response);
            } catch (err) {
                console.log({ error: "an unknown error occured" });
                return err;
            }
        }
        if (!response) { return }

        cleanList(quizzes);
        for (var id in response.quiz) {
            GlobalQuiz[response.quiz[id]] = new Object();
            quizzes[quizzes.length] = new Option(response.quiz[id], id);
        }
    }

    onChangeQuizzes = function (){
        if (!quizzes[quizzes.selectedIndex]) { return }
        cleanFormQuestions();
        okQ.value = "Create Question";

        if (Object.keys( GlobalQuiz[quizzes[quizzes.selectedIndex].innerHTML] ).length === 0) {
            getquizzesQuizDB(quizzes[quizzes.selectedIndex]['value'], load_Questions);
        } else {
            load_List_Questions(quizzes[quizzes.selectedIndex].innerHTML);
        }

    }

    load_List_Questions = function (name, data) {
        cleanList(questions);
        if (data === undefined) {
            data = GlobalQuiz[name];
        }
        console.log(data);
        for (var type in data) {
            for (var n in data[type]) {
                questions[questions.length] = new Option(data[type][n].ques, [name, type, n].join('|'));
            }
        } 
    }

    load_Questions = function () {
        if (this.readyState === 4) {
            try {
                var response = JSON.parse(this.response);
                var data = JSON.parse(JSON.parse(this.response).quiz.data);
                console.log("RESP:: ", response, this);
            } catch (err) {
                console.log({ error: "an unknown error occured" });
                return err;
            }
        }
        if (!response || !data) { return }
        if (!quizzes[quizzes.selectedIndex]) { return }

        GlobalQuiz[response.quiz.name] = data; // Guardamos en local
        
        load_List_Questions(response.quiz.name);
    }

    reloadQuiz = function () {
        if (this.readyState === 4) {
            try {
                var response = JSON.parse(this.response);
                console.log("RESP:: ", response);
            } catch (err) {
                console.log({ error: "an unknown error occured" });
                return err;
            }
        }
        if (questions.selectedIndex >= 0) {
            cleanFormQuestions();
        }

        GlobalQuiz[response.name] = GlobalDataQuiz;

        load_List_Questions(response.name);
    }

    editQuestion = function () {
        cleanFormQuestions();
        if (!quizzes[quizzes.selectedIndex]) { return }
        if (!questions[questions.selectedIndex]) { return }

        var info = questions.options[questions.selectedIndex].value.split('|');
        
        okQ.value = "Update Question";
        
        var name   = info[0];
        var type   = info[1];
        var n      = info[2];
        var quiz   = GlobalQuiz[name][type] [n];

        onSelectQ(type);
        
        thisform.getElementsByTagName("textarea")[0].value = quiz.ques; //fix this
        
        if (type == "fill" || type == "cards") {
            for (var k=0; k<inputs.length; k++ ) {
                if (inputs[k].name == "f") {
                    inputs[k].value = quiz.ans;
                    break;
                }
            }
        }
        else if (type == "tf") {
            var pass = false;
            for (var i=0; i<inputs.length; i++ ) {
                if (!pass && inputs[i].type == "radio" && inputs[i].name == "ctf") {
                    inputs[i].checked = true == quiz.ans;
                    pass = true;
                }
                else if (pass && inputs[i].type == "radio" && inputs[i].name == "ctf") {
                    inputs[i].checked = false == quiz.ans;
                    break;
                }
            }
        }
        else {
            var ans = quiz.ansSel.slice();
            for (k=1; k<inputs.length; k++ ) {
                if (inputs[k].name == "a") {
                    if (ans.length > 0) {
                        inputs[k].value = ans.shift();
                        inputs[k+2].value = quiz.ans;
                        inputs[k+1].checked = true;
                    }
                }
            }
        }
    }

    storeQuizLocal = function (quiz, question, x, anscorrect, typeQ, position) {
        if (typeof(position) == 'undefined') {
            try {
                position = GlobalQuiz[quiz][typeQ].length;  // create a new question
            }
            catch (err) {
                position = 0;
            }
        }
        var ans = x[anscorrect];
        a = x.splice(anscorrect, 1);
        
        if (typeQ == "tf") {
            ans = ans != "false";
        }

        GlobalDataQuiz = GlobalQuiz[quiz];
        if (typeQ == "multiList" || typeQ == "multi") {
            try {
                GlobalDataQuiz[typeQ] [position] = {ques: question, ans: ans, ansSel: a};
            }
            catch (ex){
                GlobalDataQuiz[typeQ] = [];
                GlobalDataQuiz[typeQ] [position] = {ques: question, ans: ans, ansSel: a};
            }
        }
        else {
            try {
                GlobalDataQuiz[typeQ] [position] = {ques: question, ans: ans};
            }
            catch (ex){
                GlobalDataQuiz[typeQ] = [];
                GlobalDataQuiz[typeQ] [position] = {ques: question, ans: ans};
            }
        }
    }

    storeQuiz = function (name, dataQuiz, typeQ, callback) {
        var id = quizzes[quizzes.selectedIndex]['value'];
        data = {type: typeQ, quiz: GlobalDataQuiz}
        updatequizQuizDB(id, name, data, callback); // XHR
    }



    updateQuestionLocal = function (question, a, anscorrect, typeQ) {
        if (!questions.options[questions.selectedIndex]) { return }
        
        var info = questions.options[questions.selectedIndex].value.split('|');
        var name = info[0];
        var type = info[1];
        var n    = info[2];

        if (type != typeQ) { // It means we need to delete the question and create a new one
            storeQuizLocal(quizzes[quizzes.selectedIndex].innerHTML, question, a, anscorrect, typeQ);
            GlobalDataQuiz[type].splice(parseInt( n, 10 ), 1);
            if (GlobalDataQuiz[type].length <= 0) {
                delete GlobalDataQuiz[type];
            }
        } else { // It means we need to overwrite the question in the position n
            storeQuizLocal(quizzes[quizzes.selectedIndex].innerHTML, question, a, anscorrect, typeQ, n);
        }
    }

    deleteQuestionLocal = function () {
        if (!questions.options[questions.selectedIndex]) { return }

        var info = questions.options[questions.selectedIndex].value.split('|');
        var name = info[0];
        var type = info[1];
        var n    = info[2];

        GlobalDataQuiz = GlobalQuiz[name];
        console.log(GlobalDataQuiz);
        GlobalDataQuiz[type].splice(parseInt( n, 10 ), 1);

        if (GlobalDataQuiz[type].length <= 0) {
            delete GlobalDataQuiz[type];
        }
        console.log("4");
        console.log(GlobalDataQuiz);

        storeQuiz(name, GlobalDataQuiz, type, reloadQuiz);
    }

    sendAddQuiz = function () {
        var name0 = "New quiz";
        var name = name0;
        var i = 0;
        while (nameExist(GlobalQuiz, name)) {
            i += 1;
            name = name0 +" ("+i+")";
        }
        console.log("BEFORE SEND ADD QUIZ");
        addquizQuizDB(name, {}, addQuizResp);
        console.log("SEND ADD QUIZ");
    }

    addQuizResp = function () {
        if (this.readyState === 4) {
            try {
                var response = JSON.parse(this.response);
                console.log("RESP:: ", response);
            } catch (err) {
                console.log({ error: "an unknown error occured" });
                return err;
            }
        }
        GlobalQuiz[response.name] = new Object();
        quizzes[quizzes.length] = new Option(response.name, response.id);
        $(quizzes).editableOptions();
    }

    deleteQuiz = function () {
        if (this.readyState === 4) {
            try {
                var response = JSON.parse(this.response);
            } catch (err) {
                console.log({ error: "an unknown error occured" });
                return err;
            }
        }
        if (!response || !quizzes[quizzes.selectedIndex]) { return }

        delete GlobalQuiz[quizzes.options[quizzes.selectedIndex].innerHTML];
        cleanList(questions);
        quizzes[quizzes.selectedIndex] = null;
    }

    deleteQuizLocal = function () {
        if (!quizzes[quizzes.selectedIndex]) { return }
        var id = quizzes[quizzes.selectedIndex]['value'];
        deleteQuestionsQuizDB(id, deleteQuiz);
    }


    getquizzesQuizDB(undefined, print_quizzes);
    

    // Make editable option select  
    (function($) {

        $.fn.editableOptions = function(callback) {

            return $(this).each(function() {

                var select = $(this);

                if (!select.data("_editableOptions_dblclick")) {
                    // Bind f2 to dblclick
                    // We can't edit all of them so only get the first
                    select.keyup(function(e) {
                        if (e.keyCode === 113) {
                            select.find('option:selected:first').dblclick();
                        }
                    });
                    select.data("_editableOptions_dblclick", true);
                }

                select.find('option').each(function() {

                    var option = $(this);

                    // Guard against multiple applications
                    if (option.data("_editableOptions_isEditable")) {
                        return;
                    }
                    option.data("_editableOptions_isEditable", true);

                    option.dblclick(function() {

                        var text = $('<input type="text" />');

                        text.css({
                            "position": "absolute",
                            "padding": 0,
                            "margin": 0,
                            "border": "none",
                            "outline": "none",
                            "font-family": select.css("font-family"),
                            "font-size": select.css("font-size"),
                        });

                        // deal with browsers that don't support option css
                        if (option.width() === 0) {

                            // interpolate the position of the options using the select's height

                            var select_size = select.attr("size");
                            var option_height;

                            // Multi-selects with no size specified will return 0 on webkit
                            if (select_size == 0) {

                                // Guess the size using a test select
                                var test = $('<select size="4">').css({
                                    display: "none",
                                    fontSize: select.css("font-size")
                                }).appendTo('body');
                                option_height = test.innerHeight() / 4;
                                test.remove();

                            } else {

                                // webkit: anything under 4 is displayed as 4 height
                                if (select_size < 4) {
                                    select_size = 4;
                                }
                                option_height = select.innerHeight() / select_size;
                            }

                            text.css({
                                "top": select.position().top +
                                    parseInt(select.css("margin-top")) +
                                    parseInt(select.css("border-top-width")) +
                                    parseInt(select.css("padding-top")) +
                                    select.attr("selectedIndex") * option_height -
                                    select.scrollTop(),
                                "left": select.position().left +
                                        parseInt(select.css("margin-left")) +
                                        parseInt(select.css("border-left-width")) +
                                        parseInt(select.css("padding-left")),
                                // the select scrollbar seems to be 11 pixels wide on webkit
                                "width": select.width() - 11,
                                // set the padding to 1 to make up for the missing border
                                "padding": 1,
                            });

                        } else {

                            var position = option.position();
                            var left_offset = position.left;
                            var top_offset = position.top;

                            if (select.css("position") === "absolute") {
                                var select_position = select.position();
                                left_offset += select_position.left + parseInt(select.css("border-left-width"));
                                top_offset += select_position.top + parseInt(select.css("border-top-width"));
                            }

                            text.css({
                                "left": left_offset,
                                "top": top_offset,
                                "padding-left": option.css("padding-left"),
                                "height": option.height(),
                                "width": option.outerWidth(),
                            });
                        }

                        var save = function(text) {
                            if (changeNameQuiz(GlobalQuiz, option.text(), text.value)) {
                                option.text(text.value);
                                $(text).remove();
                                select.focus();
                            }
                        };

                        text.val(option.text()).
                            keyup(function(e) {
                                // return saves
                                if (e.keyCode === 13) {
                                    save(this);
                                // escape cancels
                                } else if (e.keyCode === 27) {
                                    text.remove();
                                    select.focus();
                                }
                            }).
                            blur(function() {
                                text.remove();
                                select.focus();
                            }).
                            insertAfter(select).
                            focus().
                            select();
                    });

                });

            });

        };

    })(jQuery);
    $(quizzes).editableOptions();
    
    quizzes.addEventListener( "change", onChangeQuizzes, false );
    questions.addEventListener( "change", editQuestion, false );

    delQuestion.addEventListener( "click", deleteQuestionLocal, false );
    delQuiz.addEventListener( "click", deleteQuizLocal, false );
    
    addQuiz.addEventListener( "click", sendAddQuiz, false );
    addQuestion.addEventListener( "click", function () {
        cleanFormQuestions();
        questions.selectedIndex = -1;
        okQ.value = "Create Question";
        thisform.getElementsByTagName("textarea")[0].focus();
    }, false );

    selectQ.addEventListener( "change", onSelectQ, false );
    
    // Main
    onSelectQ("tf");
    dialog.enableCloseButton();


    // DEBUG

    dialog.registerActivity( "save", function( e ){
        console.log("Sumit DIALOG");
        var quiz = {
            id: null,
            name: "New One",
            data: TrueFalse,
            options: "null",
        };
        var data = JSON.stringify( quiz, null, 4 );
        console.log("POST /api/savequiz");

        XHR.post( "/api/savequiz", data, function() {
            if (this.readyState === 4) {
              try {
                var response = JSON.parse(this.response);
                console.log("RESP:: ", response);
              } catch (err) {
                console.log("an unknown error occured");
              }
            }
        }, "application/json" );
    });

    dialog.registerActivity("delete", function(e){
      console.log("DELETE /api/deletequiz");
      var pid = {
            id: 5
        };
      var data = JSON.stringify( pid, null, 4 );

        XHR.post( "/api/deletequiz", data, function() {
            if (this.readyState === 4) {
              try {
                var response = JSON.parse(this.response);
                console.log("RESP:: ", response);
              } catch (err) {
                console.log("an unknown error occured");
              }
            }
        }, "application/json" );
    });

    dialog.assignButton( ".savebutton", "save" );
    dialog.assignButton( ".deletebutton", "delete" );
    
  });
  
});

