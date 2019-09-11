function getSliderValues(){
    var $ = function (selector) {
        return document.querySelector(selector);
    };
    function changeValue(){
        this.children[1].innerHTML = "Opacity: " + this.children[0].value;
    };
    var sliders = $("body").getElementsByClassName("slidercontainer");
    var values = $("body").getElementsByClassName("slider value");

    for (var i = 0; i < sliders.length; i++) {
        var slider = sliders[i];
        var output = values[i];

        output.value = "Opacity: " + slider.children[0].value;

        slider.oninput = changeValue;
    }
}
