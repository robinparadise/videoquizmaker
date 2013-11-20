/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define( [ "text!dialog/dialogs/dinamic.html", "dialog/dialog", "util/scrollbars" ],
  function( LAYOUT_SRC, Dialog, Scrollbars ) {
    Dialog.register( "dinamic", LAYOUT_SRC, function ( dialog, _data ) {
        dialog.assignEscapeKey( "default-close" );
        dialog.assignButton( ".close-button", "close" );
        dialog.enableCloseButton();
        var _options = _data.popup;

        var $rootElement = $( dialog.rootElement );
        // Headers
        $headers           = $rootElement.find("a.popup-tab-header-a"),
        $headerScore       = $headers.filter(".header-score"),
        $headerQuestions   = $headers.filter(".header-questions"),
        $headerPass        = $headers.filter(".header-pass"),
        // Tabs
        $popupTab          = $rootElement.find(".popup-tab"),
        $popupScore        = $popupTab.filter(".popup-score"),
        $popupQuestions    = $popupTab.filter(".popup-questions"),
        $popupPass         = $popupTab.filter(".popup-pass"),
        // Score
        $assuredScore      = $popupScore.find(".assured-score"),
        $score             = $popupScore.find(".score"),
        // Questions
        $questions         = $popupQuestions.find(".questions"),
        // Pass
        $assuredPass       = $popupPass.find(".assured-pass"),
        // Hidden elements
        $hiddenFields      = $rootElement.find("#append-hidden-elements"),
        // Quizzes
        GlobalQuiz         = this.Butter.QuizOptions;

        var addScrollbar = function( scrollbarContainer ) {
            var scrollbarInner = scrollbarContainer.querySelector( ".scrollbar-inner" );
            var scrollbarOuter = scrollbarContainer.querySelector( ".scrollbar-outer" );

            var options = options || scrollbarInner && {
                inner: scrollbarInner,
                outer: scrollbarOuter || scrollbarInner.parentNode,
                appendTo: scrollbarContainer || rootElement
            };
            if ( !options ) return;

            dialog.scrollbar = new Scrollbars.Vertical( options.outer, options.inner );
            options.appendTo.appendChild( dialog.scrollbar.element );

            dialog.scrollbar.update();
            return dialog.scrollbar;
        };

        var appendToList = function($list, text, attrs) {
            $elem = $(document.createElement( "li" ));
            $elem.text(text);
            $.each(attrs, function(name, value) {
                $elem.attr(name, value); // attributes
            });
            var $respondField = $hiddenFields.find(".assured-pass-wrapper").clone().hide();
            $list.append($elem);
            $elem.append($respondField);
        }

        var togglePopupTab = function(keyrule) {
            if (!keyrule) keyrule = _options.keyrule;
            // show the keyrule tab
            if (keyrule === "score") {
                $headerScore.click();
            } else if (keyrule === "questions") {
                $headerQuestions.click();
            } else if (keyrule === "answers") {
                $headerScore.click();
            } else if (keyrule === "pass") {
                $headerPass.click();
            }
            // Desactive the undefined keyrules
            !_options.score     && !!$headerScore.hide();
            !_options.questions && !!$headerQuestions.hide();
            !_options.pass      && !!$headerPass.hide();
        }

        var setScore = function(score) {
            if (!score) score = _options.score;
            $assuredScore.find("[value='"+score[0]+"']").prop("selected", true);
            $score.val(score[1]);
            _options.keyrule = "score";
        }

        var appendQuestions = function(questions) {
            if (!questions) questions = _options.questions;
            var name = questions.name;
            var data = GlobalQuiz[name];
            // append questions
            if ($questions.find("li").length <= 0) {
                $questions.text(""); // empty, who knows
                for (var type in data) {
                    for (var n in data[type]) {
                        appendToList($questions, data[type][n].ques, {
                            question: [name, type, n].join('|'),
                            quesname: name,
                            questype: type,
                            quespos: n
                        });
                    }
                }
            }
            // click question
            if (!$questions.find(".selected").hasClass("selected")) {
                $questions.find("li:first").click();
            } else {
                $questions.find(".selected").click();
            }
        }

        var setQuestions = function(questions) {
            if (!questions) questions = _options.questions;
            var $selected;
            _options.keyrule = "questions";

            // select the question
            if (questions.attr) {
                $selected = $questions.find("[question='"+questions.attr+"']");
            }
            else if (questions.type && questions.n) {
                var attrQuestions = [questions.name, questions.type, questions.n].join("|");
                $selected = $questions.find("[question='"+attrQuestions+"']");
            }
            else {
                return;
            }

            // Select Assured by answer
            if (questions.assured === "answer pass") {
                $selected.find(".value-answer-pass").prop("checked", true);
                if (questions.answerpass === true || questions.answerpass === "true") {
                    $selected.find(".answer-pass [value='true']").prop("selected", true);
                }
                else {
                    $selected.find(".answer-pass [value='false']").prop("selected", true);
                }
            }
            else if (questions.assured === "specific answer") {
                $selected.find(".value-specific-answer").prop("checked", true);
            }
        }
        var setParamsQuestion = function($that) {
            var questions = _options.questions;
            var $assuredAnswerPass = $that.parents(".assured-pass-wrapper");

            var assured = $assuredAnswerPass.find(".value-answer-pass").prop("checked");
            if (assured) {
                questions.assured = "answer pass";
            } else {
                questions.assured = "specific answer";
            }

            questions.answerpass = $assuredAnswerPass.find(".answer-pass :selected").val();
            questions.userAnswer = $assuredAnswerPass.find(".specific-user-answer :selected").val();
        }

        var setPass = function(pass) {
            if (!pass) pass = _options.pass;
            $assuredPass.find("[value='"+pass+"']").prop("selected", true);
            _options.keyrule = "pass";
        }
            
        var reloadPopup = function() {
            if (_options) {
                var offsetGlobalY = 62 + 17; // ?? offset of the body
                var offsetGlobalX = 20;
                var offsetHeight  = 40;    // Arrow height
                var height = $rootElement.height() + offsetHeight;
                $rootElement.css({
                    "left": _options.left - offsetGlobalX,
                    "top": _options.top - height - offsetGlobalY
                });
            }
        }

        $(function() {
            // Score Changes
            if (_options.score) {
                $headerScore.click(function() {
                    if ( $(this).hasClass(".butter-active") ) return;
                    $headers.removeClass("butter-active");
                    $headerScore.addClass("butter-active");
                    $popupTab.hide();
                    $popupScore.show();
                    setScore();
                });
                $assuredScore.change(function(ev) {
                    _options.score[0] = $assuredScore.find(":selected").attr("value");
                    _options.keyrule = "score";
                });
                $score.change(function() {
                    _options.score[1] = this.value;
                    _options.keyrule = "score";
                });
            }

            // Questions
            if (_options.questions) {
                $questions.on("click", "li", function(ev) {
                    var $that = $(this);
                    if (!$that.hasClass("selected")) {
                        $questions.find(".selected").removeClass("selected").find(".assured-pass-wrapper").slideUp();
                        $that.addClass("selected");
                        $that.find(".assured-pass-wrapper").slideDown(function() {
                            dialog.scrollbar.update();
                        });

                        var name = _options.questions.name;
                        var attr = $that.attr("question");
                        var type = $that.attr("questype");
                        var pos  = Number($that.attr("quespos"));
                        _options.questions.attr = attr;
                        _options.questions.type = type;
                        _options.questions.n    = pos;
                        _options.questions.ques = GlobalQuiz[name][type][pos].ques;
                        setQuestions();
                    }
                });
                $headerQuestions.click(function(ev) {
                    if ( $(this).hasClass("butter-active") ) {
                        dialog.scrollbar.update();
                        return;
                    }
                    $headers.removeClass("butter-active");
                    $headerQuestions.addClass("butter-active");
                    $popupTab.hide();
                    $popupQuestions.show();
                    appendQuestions();
                    dialog.scrollbar.update();
                });

                $questions.on("change", "[name='assured-pass']", function(ev) {
                    ev.preventDefault();
                    setParamsQuestion($(this));
                });
                $questions.on("change", ".answer-pass", function(ev) {
                    ev.preventDefault();
                    setParamsQuestion($(this));
                });
                $questions.on("change", ".specific-user-answer", function(ev) {
                    ev.preventDefault();
                    setParamsQuestion($(this));
                });
            }

            // Pass Changes
            if (_options.pass) {
                $headerPass.click(function() {
                    if ( $(this).hasClass(".butter-active") ) return;
                    $headers.removeClass("butter-active");
                    $headerPass.addClass("butter-active");
                    $popupTab.hide();
                    $popupPass.show();
                    setPass();
                });
                $assuredPass.change(function() {
                    _options.pass = $assuredPass.find(":selected").val();
                    _options.keyrule = "pass";
                });
            }

            dialog.registerActivity( "delete", function(){
              dialog.send( "delete", _data.lineId );
            });
            dialog.assignButton( ".delete", "delete" );

            addScrollbar($popupQuestions[0]);
            togglePopupTab();
            // Reload position of the popup
            $rootElement.show("fast", reloadPopup);
        });

    });
});
