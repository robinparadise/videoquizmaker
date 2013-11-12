/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at http://www.mozillapopcorn.org/butter-license.txt */

define([ "text!dialog/dialogs/quizme.html", "dialog/dialog", "util/xhr" ],
  function( LAYOUT_SRC, Dialog, XHR ) {

  Dialog.register( "quizme", LAYOUT_SRC, function( dialog ) {

    var rootElement    = dialog.rootElement,
        quizzes        = rootElement.querySelector( ".quizzes" ),
        questions      = rootElement.querySelector( ".questions" ),
        selectTypeAns  = rootElement.querySelector( ".select-type-answer" ),
        questionInput  = rootElement.querySelector( ".question-input" ),
        addUpdateQues  = rootElement.querySelector( ".add-update-question" ),
        $rootElement   = $( rootElement ),
        $quizzes       = $( quizzes ),
        $questions     = $( questions ),
        $selectTypeAns = $( selectTypeAns ),
        $addUpdateQues = $( addUpdateQues ),
        $answers       = $rootElement.find( ".answer" ),
        $deleteQues    = $rootElement.find( ".delete-question" ),
        $addQuestion   = $rootElement.find( ".add-question" ),
        $addQuiz       = $rootElement.find( ".add-quiz" ),
        GlobalQuiz     = this.Butter.QuizOptions,
        TempDataQuiz   = new Object();

    // Save and Close (on variable Butter.QuizOptions)
    var saveAndClose = function () {
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

    // Animation Pulse, Delete
    (function($) {
        $.fn.fancyAnimate = function(options, callback) {
            if (!options) options = {};
            options.duration  = 510;
            if (options.mode === "add") {
                options.attrClass = "pulse focus-light animated-half";
            } else if (options.mode === "update" || options.mode === "update all") {
                options.attrClass = "pulse animated-half";
            } else if (options.mode === "delete") {
                options.attrClass = "pulse animated-half";
            } else { // default
                options.duration  = 1100;
                options.attrClass = "pulse focus-red animated-one";
            }
            return $(this).each(function() {
                var $that = $(this);
                $that.addClass(options.attrClass);
                setTimeout(function() {
                    $that.removeClass(options.attrClass);
                    !!callback && callback();
                }, options.duration);
            });
        }
    })(jQuery);


    var appendToList = function($list, text, attrs, action) {
        var focus, $elem;

        if (action === "add") { // Create element, Append last and Animate
            focus = !!( $elem = $(document.createElement( "li" )) );
        } else if (action === "update") { // Update selected and Animate
            focus = !!( $elem = $list.find(".selected") );
        } else if (action && action.animate === "update all") {
            $elem = $(document.createElement( "li" ));
            if (attrs[action.attr] === action.question) { // Then animate and select
                focus = !!( $elem.addClass("selected") );
            }
        } else { // else just append element
            $elem = $(document.createElement( "li" ));
        }

        $elem.text(text);
        $.each(attrs, function(name, value) {
            $elem.attr(name, value); // attributes
        });
        action !== "update" && $list.append($elem);
        focus  === true     && $elem.fancyAnimate({mode:action});
    }

    var stripBlanks = function (field) {
        var result = "";
        var c = 0;
        for (var i=0; i < field.length; i++) {
            if (field.charAt(i) != " " || c > 0) {
                result += field.charAt(i);
                if (field.charAt(i) != " ") {
                    c = result.length;
                }
            }
        }
        return result.substr(0,c);
    }

    var manager = {
        receiveQuizzes: function(data) {
            if (!data) {
                console.log({ error: "[addQuizzes]: an unknown error occured" });
            }
            else if (data.error === "unauthorized") {
                dialog.activity( "default-close" );
                dialog = Dialog.spawn( "unauthorized" ).open();
            }
            else if (data.error && data.error !== "okay") {
                console.log(data.error);
            }
            else {
                quizzes.innerHTML = ""; // clean quizzes list
                for (var id in data.quiz) {
                    if (!GlobalQuiz[data.quiz[id]]) {
                        GlobalQuiz[data.quiz[id]] = new Object();
                    }
                    appendToList($quizzes, data.quiz[id], {
                        "quizname": data.quiz[id],
                        "quizId": id
                    });
                }
                manager.isFirstStart && manager.firstStart();
            }
        },
        receiveQuiz: function (data) {
            var action;
            if (!data) {
                console.log({ error: "[receiveQuiz]: an unknown error occured" });
            }
            else if (data.error === "unauthorized") {
                dialog.activity( "default-close" );
                dialog = Dialog.spawn( "unauthorized" ).open();
            }
            else if (data.error && data.error !== "okay") {
                console.log(data.error);
            }
            else if (TempDataQuiz && Object.keys(TempDataQuiz).length > 0) {
                var name = Object.keys(TempDataQuiz)[0];
                var dataQuestions = $.extend({}, TempDataQuiz[name]);
                action = $.extend({}, TempDataQuiz["#action#"]);
                TempDataQuiz = undefined;
            }
            else {
                try {
                    var dataQuestions = data.quiz.data;
                    var name = data.quiz.name;
                    if (typeof(dataQuestions) === "string") {
                        dataQuestions = JSON.parse(dataQuestions);
                    }
                } catch (err) {
                    console.log({ error: "an unknown error occured" }, err);
                    return;
                }
            }
            GlobalQuiz[name] = Object.create(dataQuestions); // Save
            manager.appendQuestions(name, GlobalQuiz[name], action);
        },
        appendQuestions: function (name, data, action) {
            if (!data) data = GlobalQuiz[name];
            if (action && action.animate === "add") { // append just this one
                appendToList($questions, data[action.type][action.n].ques, {
                    'question': action.question }, action.animate);
                manager.cleanQuestionEdit();
            }
            else if (action && action.animate === "update") { // Update just this one
                appendToList($questions, data[action.type][action.n].ques, {
                    'question': action.question }, action.animate);
            }
            else { // Append All: update all, delete one or append all
                questions.innerHTML = ""; // clean all questions
                for (var type in data) {
                    for (var n in data[type]) {
                        appendToList($questions, data[type][n].ques, {
                            'question': [name, type, n].join('|')
                        }, action);
                    }
                }
                !!action && action.animate === "delete" && manager.cleanQuestionEdit();
            }
        },
        getQuiz: function (name) {
            if (Object.keys( GlobalQuiz[name] ).length === 0) {
                quizDB.getquiz(name, manager.receiveQuiz);
            } else {
                manager.appendQuestions(name);
            }
        },
        // Choose The type of select option: multilist, truefalse, fill, list, cards.
        changeTypeAnswer: function(select) {
            if (select && typeof(select) === "object") { // default event
                var selectType = select.target.value;
            }
            else if (select && typeof(select) === "string") { // params string
                var selectType = select;
                $selectTypeAns.find("."+select)[0].selected = true; // force select
            }
            else if ($selectTypeAns.find(":selected")) { // no params
                var selectType = $selectTypeAns.find(":selected").val();
            }
            else { return }

            $answers.hide();
            if (selectType === "type-tf") {
                $answers.filter(".truefalse").show();
            } else if (selectType === "type-multiList" || selectType === "type-multi") {
                $answers.filter(".multi").show();
            } else {
                $answers.filter(".ans-fill").show();
            }
        },
        showEditQuestion: function (dataStr) {
            manager.cleanQuestionEdit("Update");

            // Parse dataStr: name|type|n
            var info = dataStr.split('|');
            var name = info[0];
            var type = info[1];
            var n    = info[2];
            var quiz = GlobalQuiz[name][type] [n];

            manager.changeTypeAnswer("type-"+type);
            questionInput.value = quiz.ques;
            
            if (type == "fill" || type == "cards") {
                $answers.filter(".ans-fill").val(quiz.ans);
            }
            else if (type == "tf") {
                $answers.filter(".value-true")[0].checked = true == quiz.ans;
                $answers.filter(".value-false")[0].checked = false == quiz.ans;
            }
            else { // improve this, when inputs < answers
                var answers = quiz.ansSel.slice(0);
                var $inputs = $answers.filter(".multi.ans-multi");
                $inputs.filter(function() {
                    if (answers.length > 0) {
                        this.value = answers.shift(); // answer
                        if ($inputs[ $inputs.index(this) + 1 ]) { // correct answer
                            var nextNode = $inputs[ $inputs.index(this) + 1 ];
                            nextNode.value = quiz.ans;
                            $(nextNode).parent().find("[name=multi]").prop("checked", true);
                        }
                    }
                });
            }
        },
        cleanQuestionEdit: function (valueBtn) {
            // Smart: dont clean when Btn.value === "Add"
            if (valueBtn === "smart" && addUpdateQues.value === "Add" ) {
                $deleteQues.hide();
                return;
            } // smart options
            if (valueBtn === "smart") valueBtn = "Add"; // Default
            if (!valueBtn) valueBtn = "Add"; // Default
            // clean all
            questionInput.value = "";
            $answers.filter("[type=text]").val("");
            $answers.filter("[type=radio]:checked").prop("checked", false);
            addUpdateQues.value = valueBtn;
            $addUpdateQues.hide();
            // hide deleteBtn when Btn.value === "Add", viceversa show it
            valueBtn === "Add"    && $deleteQues.hide();
            valueBtn === "Update" && $deleteQues.show();
        },
        isFirstStart: true,
        firstStart: function() {
            manager.isFirstStart = false;
            $quizzes.find(":first")[0].click();
        }
    }

    /*** Quiz DB ***/
    var quizDB = {
        getquizzes: function(callback) {
            XHR.get("/api/quizzes/", callback);
        },
        getquiz: function(name, callback) {
            if (name === undefined) { return }
            XHR.get("/api/quizzes/name/"+name, callback);
        },
        updatequiz: function (id, name, data, callback) {
            if (!data) { data = {} }
            var quiz = {
                id: id,
                name: name,
                data: data,
                options: ""
            }
            XHR.post("/api/updatequiz", quiz, callback, "application/json");
        },
        deletequiz: function (id, callback) {
            if ( isNaN(Number(id) ) ) {
                console.log("Error ID:" + id + " is not a valid Number");
            }
            var pid = { id: Number(id) };
            XHR.post( "/api/deletequiz", pid, callback, "application/json" );
        },
        savequiz: function (name, data, callback) {
            if (data === undefined) { data = {} }
            var quiz = {
                id: null,
                name: name,
                data: data,
                options: null,
            }
            XHR.post( "/api/savequiz", quiz, callback, "application/json" );
        }
    }

    var updateQuizTemp = function (question, answers, anscorrect, newType) {
        var info = $questions.find(".selected").attr("question").split('|');
        var name = info[0];
        var type = info[1];
        var n    = info[2];

        if (type != newType) { // It means we need to delete the question and create a new one
            storeQuizTemp(name, question, answers, anscorrect, newType, undefined, "update all");
            TempDataQuiz[name][type].splice(parseInt( n, 10 ), 1);
            if (TempDataQuiz[name][type].length <= 0) {
                delete TempDataQuiz[name][type];
            }
        }
        else { // It means we need to overwrite the question in the position n
            storeQuizTemp(name, question, answers, anscorrect, newType, n, "update");
        }
    }

    var storeQuizTemp = function (name, question, answers, anscorrect, type, position, action) {
        TempDataQuiz = new Object;
        TempDataQuiz[name] = $.extend({}, GlobalQuiz[name]);
        if (!position && TempDataQuiz[name][type]) { // create a new question
            position = TempDataQuiz[name][type].length;
        } else if (!position && !GlobalQuiz[name][type]) {
            position = 0;
            TempDataQuiz[name][type] = [];
        } // if position then name & type exist

        if (type == "multiList" || type == "multi") {
            TempDataQuiz[name][type] [position] = {ques: question, ans: anscorrect, ansSel: answers};
        }
        else { // Fill, cards, true-false
            TempDataQuiz[name][type] [position] = {ques: question, ans: anscorrect};
        }
        TempDataQuiz["#action#"] = { // info to animate the element
            animate: action,
            name: name,
            type: type,
            n: position,
            question: [name, type, position].join("|"),
            attr: "question"
        }
    }

    var saveQuiz = function (name, callback) {
        var id = $quizzes.find(".selected").attr("quizId");
        quizDB.updatequiz(id, name, TempDataQuiz[name], callback);
    }

    selectTypeAns.addEventListener( "change", manager.changeTypeAnswer, false );

    $quizzes.click(function(ev) {
        var $that = $(ev.srcElement);
        if (ev.srcElement && !$that.hasClass("quizzes") && !$that.hasClass("selected")) {
            $quizzes.find(".selected").removeClass("selected");
            $questions.find(".selected").removeClass("selected");
            $that.addClass("selected");
            manager.getQuiz($that.text());
            manager.cleanQuestionEdit("smart");
        }
        return false;
    });

    $questions.click(function(ev) {
        var $that = $(ev.srcElement);
        if (ev.srcElement && !$that.hasClass("questions") && !$that.hasClass("selected")) {
            $questions.find(".selected").removeClass("selected");
            $that.addClass("selected");
            manager.showEditQuestion($that.attr("question"));
        }
        return false;
    });
    $addQuestion.click(function() {
        $questions.find(".selected").removeClass("selected");
        manager.cleanQuestionEdit("smart");
        questionInput.focus();
    })

    $deleteQues.click(function(ev) {
        var $deleted = $questions.find(".selected").addClass("deleted");
        var info = $deleted.attr("question").split("|");
        var name = info[0];
        var type = info[1];
        var pos  = info[2];
        TempDataQuiz = new Object;
        TempDataQuiz[name] = $.extend({}, GlobalQuiz[name]);
        TempDataQuiz[name][type].splice(parseInt( pos, 10 ), 1);
        TempDataQuiz[name][type].length < 0 && delete TempDataQuiz[name][type];
        TempDataQuiz["#action#"] = {animate: "delete"}
        saveQuiz(name, manager.receiveQuiz);
        return false;
    });

    // When it clicks "Update Question" or "Create Question" 
    addUpdateQues.addEventListener( "click", function () {
        var question = stripBlanks(questionInput.value);
        var typeAns = $selectTypeAns.find(":selected").attr("typequiz");
        var anscorrectIndex = -1; // IndexOf correct answer
        
        if (question == '') {  // alert("You must enter a question");
            $(questionInput).fancyAnimate();
            $(this).fancyAnimate();
            return false;
        }
        
        // Search inputs answers from Multilist, TrueFalse, Fill... Quiz
        var answers = [];
        if (typeAns == "fill" || typeAns == "cards") {
            var ansFill = stripBlanks( $answers.filter(".ans-fill").val() );
            if (ansFill !== '') {
                answers.push(ansFill);
            } else {
                $answers.filter(".ans-fill").fancyAnimate();
                $(this).fancyAnimate();
                return false;
            }
            anscorrectIndex = 0; // IndexOf correct answer
        }
        else if (typeAns == "tf") { // type TrueFalse
            if ($answers.filter(".truefalse[type=radio]:checked").length > 0) {
                var valueTrueChecked = $answers.filter(".value-true:checked")[0];
                if (valueTrueChecked && valueTrueChecked.checked) {
                    answers = [true];
                } else {
                    answers = [false];
                }
                anscorrectIndex = 0; // IndexOf correct answer
            } else { // Focus radio box!
                console.log("[Truefalse select checkbox!]");
                $answers.filter(".truefalse").parent().fancyAnimate();
                $(this).fancyAnimate();
                return false;
            }
        }
        else { // type MultiList and List
            var $anscorrectInputRadio = $answers.filter(".radio-multi:checked");
            if ($anscorrectInputRadio.length > 0) {
                var $inputRadio = $answers.filter(".radio-multi");
                anscorrectIndex = $inputRadio.index( $anscorrectInputRadio[0] );
            } else { // Focus radio box!
                console.log("[multi select checkbox!]");
                $answers.filter(".multi").fancyAnimate();
                $(this).fancyAnimate();
                return false;
            }

            var $inputs = $answers.filter(".multi.ans-multi");
            $inputs.filter(function() {
                answers.push( stripBlanks(this.value) );
            });
            
            // You must enter at least 2 answers
            if (answers[0] === '' || answers[1] === '') {
                console.log("[You must enter at least 2 answers!]");
                $answers.filter(".ans-multi:lt(2)").fancyAnimate();
                $(this).fancyAnimate();
                return false;
            }
        }

        // Null
        for (var i=0; i<answers.length; i++) {
            if (anscorrectIndex === i && answers[i] === '') {
                console.log("[anscorrect Null!]");
                $answers.filter(".ans-multi:eq("+anscorrectIndex+")").fancyAnimate();
                $(this).fancyAnimate();
                return false;
            };
        }
        // equality
        for (var i=1; i<answers.length; i++) {
            for (var j=0; j<i; j++) {
                if (answers[i] && answers[j] && answers[i] === answers[j]) {
                    console.log("[Equality]");
                    $answers.filter(".ans-multi:eq("+i+")").fancyAnimate();
                    $answers.filter(".ans-multi:eq("+j+")").fancyAnimate();
                    $(this).fancyAnimate();
                    return false;
                }
            }
        }
        // get anscorrect from answers
        var answercorrect = answers[anscorrectIndex];
        answers.splice(anscorrectIndex, 1);
        answers = answers.filter(function(arr) {return arr}); // clean empty answer
        var nameQuiz = $quizzes.find(".selected").text();

        if ($questions.find(".selected").length > 0) { // It means we just have to update question
            updateQuizTemp(question, answers, answercorrect, typeAns);
        }
        else { // Create a new one
            storeQuizTemp(nameQuiz, question, answers, answercorrect, typeAns, undefined, "add");
        }
        saveQuiz(nameQuiz, manager.receiveQuiz);
    }, false );

    // Show button Update when changes
    questionInput.addEventListener( "input", function(ev) {
        addUpdateQues.value === "Update" && $addUpdateQues.show();
    }, false );
    $answers.filter("[type=text]").on("input", function(ev) {
        addUpdateQues.value === "Update" && $addUpdateQues.show();
    });
    $answers.filter("[type=radio]").change(function(ev) {
        addUpdateQues.value === "Update" && $addUpdateQues.show();
    });
    $selectTypeAns.change(function(ev) {
        addUpdateQues.value === "Update" && $addUpdateQues.show();
    });


    manager.changeTypeAnswer("type-tf");       // by default answer quiz is true-false
    quizDB.getquizzes(manager.receiveQuizzes); // On start dialog load quizzes

    // Test

/*    var testFunc = function(response) {
       console.log("[testFunc][response]", response);
   }*/
//    quizDB.getquiz("Fill", testFunc);
//

/*quizDB.deletequiz(1, testFunc);
quizDB.deletequiz(2, testFunc);
quizDB.deletequiz(3, testFunc);*/



    
    
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

/*

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

    var addQuizResp = function (response) {
        if (!response) {
            console.log({ error: "an unknown error occured" });
            return;
        }
        if (response.error !== "okay" && response.error !== undefined) {
            console.log(response.error);
            return;
        }
        GlobalQuiz[response.name] = new Object();
        quizzes[quizzes.length] = new Option(response.name, response.id);
        $(quizzes).editableOptions();
    }
*/
    
  });
  
});

