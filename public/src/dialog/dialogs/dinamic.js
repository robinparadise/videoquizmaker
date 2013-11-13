/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define( [ "text!dialog/dialogs/dinamic.html", "dialog/dialog" ],
  function( LAYOUT_SRC, Dialog ) {
    Dialog.register( "dinamic", LAYOUT_SRC, function ( dialog, _options ) {
        dialog.assignEscapeKey( "default-close" );
        dialog.assignButton( ".close-button", "close" );
        dialog.enableCloseButton();

console.log("[Click for dinamic dialog]", _options);

        var $rootElement = $( dialog.rootElement );
        // Headers
        $headers         = $rootElement.find("a.popup-tab-header-a"),
        $headerScore     = $headers.filter(".header-score"),
        $headerQuestions = $headers.filter(".header-questions"),
        $headerPass      = $headers.filter(".header-pass"),
        // Tabs
        $popupTab        = $rootElement.find(".popup-tab"),
        $popupScore      = $popupTab.filter(".popup-score"),
        $popupQuestions  = $popupTab.filter(".popup-questions"),
        $popupPass       = $popupTab.filter(".popup-pass"),
        // Score
        $assuredScore    = $popupScore.find(".assured-score"),
        $score           = $popupScore.find(".score"),
        // Questions
        $questions       = $popupQuestions.find(".questions"),
        // Pass
        $assuredPass     = $popupPass.find(".assured-pass"),
        // Quizzes
        GlobalQuiz       = this.Butter.QuizOptions;


        var appendToList = function($list, text, attrs) {
            $elem = $(document.createElement( "li" ));
            $elem.text(text);
            $.each(attrs, function(name, value) {
                $elem.attr(name, value); // attributes
            });
            $list.append($elem);
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
            !_options.score     && !!$headerScore.hide()     && !!$popupScore.hide();
            !_options.questions && !!$headerQuestions.hide() && !!$popupQuestions.hide();
            !_options.pass      && !!$headerPass.hide()      && !!$popupPass.hide();
        }

        var setScore = function(score) {
            if (!score) score = _options.score;
            $assuredScore.find("[value='"+score[0]+"']").prop("selected", true);
            $score.val(score[1]);
            _options.keyrule = "score";
        }

        var setQuestions = function(questions) {
            if (!questions) questions = _options.questions;
            var name = questions[0];
            var data = GlobalQuiz[name];
            $questions.text("");
            for (var type in data) {
                for (var n in data[type]) {
                    appendToList($questions, data[type][n].ques, {
                        'question': [name, type, n].join('|')
                    });
                }
            }
            //var attr = questions[1];
            //_options.keyrule = "questions";
        }

        var setPass = function(pass) {
            if (!pass) pass = _options.pass;
            $assuredPass.find("[value='"+pass+"']").prop("selected", true);
            _options.keyrule = "pass";
        }
            
        var reloadPopup = function() {
            if (_options) {
                var offsetGlobalY = 62 + 17; // ?? No idea
                var offsetGlobalX = 20;     // ?? No idea
                var offsetHeight  = 47;    // Arrow height
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
                $headerQuestions.click(function() {
                    if ( $(this).hasClass(".butter-active") ) return;
                    $headers.removeClass("butter-active");
                    $headerQuestions.addClass("butter-active");
                    $popupTab.hide();
                    $popupQuestions.show();
                    setQuestions();
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

            togglePopupTab();
            // Position of the popup
            $rootElement.show("fast", reloadPopup);
        });

    });
});
