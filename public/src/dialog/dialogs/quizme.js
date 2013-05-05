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
        GlobalQuiz  = this.Butter.QuizOptions,
        GlobalDataQuiz  = new Object();

    
    //*** BD Quiz ***//

    var getquizzesQuizDB = function (id, callback) {
        if (id === undefined) { id = "" }
        XHR.get("/api/quizzes/" + id, callback);
    }

    var updatequizQuizDB = function (id, name, data, callback) {
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

    var deleteQuestionsQuizDB = function (id, callback) {
        var pid = { id: id };
        var data = JSON.stringify( pid, null, 4 );
        XHR.post( "/api/deletequiz", data, callback, "application/json" );
    }

    var addquizQuizDB = function (name, data, callback) {
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
        
    var stripBlanks = function (fld) {
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
    
    var cleanFormQuestions = function () {
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
    
    var cleanList = function (obj) {
        obj.innerHTML = "";  // remove all select list options
    }


    // Choose The type of select option: Multilist, TrueFalse, Fill, List, Cards.
    var onSelectQ = function(select) {
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
    var addRow = function () {
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
    
    
    var changeNameQuiz = function(obj, name, newname) {
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
    
    var nameExist = function (obj, newname) {
        return obj[newname] !== undefined;
    }


    // *** Interaction (callbacks) with BD *** //

    var print_quizzes = function(data) {
        console.log(" [print_quizzes] " + data);
        if (this.readyState === 4) {
            try {
                var response = JSON.parse(this.response);
                console.log("RESP:: ", response);
            } catch (err) {
                console.log({ error: "an unknown error occured" });
                return err;
            }
        }
        console.log(" [response] " + response['error']);
        if (!response) { return }
        if (response['error'] === "unauthorized") {
            dialog.activity( "default-close" );
            dialog = Dialog.spawn( "unauthorized" ).open();
        }

        cleanList(quizzes);
        for (var id in response.quiz) {
            if (!GlobalQuiz[response.quiz[id]]) {
                GlobalQuiz[response.quiz[id]] = new Object();
            }
            quizzes[quizzes.length] = new Option(response.quiz[id], id);
        }
    }

    var onChangeQuizzes = function (){
        if (!quizzes[quizzes.selectedIndex]) { return }
        cleanFormQuestions();
        okQ.value = "Create Question";

        if (Object.keys( GlobalQuiz[quizzes[quizzes.selectedIndex].innerHTML] ).length === 0) {
            getquizzesQuizDB(quizzes[quizzes.selectedIndex]['value'], load_Questions);
        } else {
            load_List_Questions(quizzes[quizzes.selectedIndex].innerHTML);
        }

    }

    var load_List_Questions = function (name, data) {
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

    var load_Questions = function () {
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

    var reloadQuiz = function () {
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

    var editQuestion = function () {
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

    var storeQuizLocal = function (quiz, question, x, anscorrect, typeQ, position) {
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

    var storeQuiz = function (name, dataQuiz, typeQ, callback) {
        var id = quizzes[quizzes.selectedIndex]['value'];
        data = {type: typeQ, quiz: GlobalDataQuiz}
        updatequizQuizDB(id, name, data, callback); // XHR
    }

    var updateQuestionLocal = function (question, a, anscorrect, typeQ) {
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

    var deleteQuestionLocal = function () {
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

    var sendAddQuiz = function () {
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

    var addQuizResp = function () {
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

    var deleteQuiz = function () {
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

    var deleteQuizLocal = function () {
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
    

    // Listener
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

    // Save and Close (on variable Butter.QuizOptions)
    var saveAndClose = function () {
        this.Butter.QuizOptions = {};
        this.Butter.QuizOptions = GlobalQuiz;
        this.Popcorn.manifest.quizme.options.name.options = ["Default"];
        for (name in GlobalQuiz) {
            this.Popcorn.manifest.quizme.options.name.options.push(name);
        }
    }
    dialog.registerActivity( "close", function( e ) {
        saveAndClose();
    });
    dialog.assignButton( ".close-button", "close" );
    dialog.enableCloseButton();
    
  });
  
});

