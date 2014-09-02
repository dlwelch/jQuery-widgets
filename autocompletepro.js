/*
autocompletepro 0.0
https://github.com/dlwelch/jQuery-widgets
Copyright © 2014 Dedra L. Welch 
Licensed MIT:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

http://opensource.org/licenses/mit-license.php
*/
$.widget("custom.autocompletepro", $.ui.autocomplete, {
/*
    source = [{"label": "this is the REQUIRED label", 
               "category":"OPTIONAL category", 
               "othername": "othervalue", 
               "otherobject" : {...} , ....}]
*/
    options: {
        itemsshown: 0,//0 shows all
        filter: [],
        searchfields: [],
        defaultvalue: [],
        datasource: [],
        filtereddatasource: [], //read only
        autodrop: false,
        minLength: 0,
        categorize: false,
        categoryfield: "category"
    },
/*
    private property to hold selected object
    underscore is not neccessary, just a reminder it's private
*/
    _selectedvalue: null,
    value: function () {
        if ($.type(this._selectedvalue) === "undefined") { return null; }
        else {
            return this._selectedvalue;
        }
    },
/*
    selects a specified single item passed in an array
     i.e. [{"one": "1", "two" : "2 ", ... }]
     since we are using _compareObjectKeys function
     remember, we really don't care about the value element of ui.item
     so no need to fire the select event
*/
    selectitem: function (item) {
        if ($.isArray(item)) {
            var _that = this;
            var myItem = $.grep(this.options.filtereddatasource, function (element, index) {
                return _that._compareObjectKeys(element, item);
            });
            if (myItem.length > 0) {
                this.element.val(myItem[0].label);
                this._selectedvalue = myItem[0];
            }
            else {
                this.element.val("");
                this._selectedvalue = null;
            }
        }     
    },
/*
    private methods
*/
    _create: function () {
        var _that = this;
        // this.element is a reference to the input box      
        this.element.addClass("ui-widget");
        this._definefiltereddatasource();
        this.selectitem(this.options.defaultvalue);
        this._definesource();
        //autodrop overrides minLength
        if (this.options.autodrop) {
            this.options.minLength = 0;
            this.element.focus(function (event, ui) {
                $(this).autocompletepro("search", "");
            });
        }
/*
        this cannot be changed by user
        user must select from drop down or enter "nothing". 
        if they've entered empty string or just spaces, clear selected value and input textbox
        otherwise, just set it to the latest selected value
        this way it doesn't matter if change fires after select (like in Chrome 36.0.1985.143 m)
        or if change fires before select (like in IE 10.0.9200.17028)
*/
        this.options.change = function (event, ui) {
            if ($.trim(_that.element.val()) === "") {
                _that.element.val("");
                _that._selectedvalue = null;
            } else {
                if ($.type(_that._selectedvalue) === "null") {
                    _that.element.val("");
                } else {
                    _that.element.val(_that._selectedvalue.label);
                }
            }
        }
/*
        this cannot be changed by user
        retain the selected object in a "private" variable _selectedvalue
        if we auto dropped, then blur when we select so that we can autodrop again by clicking
*/
        this.options.select = function (event, ui) {
            _that._selectedvalue = $.extend(true, {}, ui.item);
            if (_that.options.autodrop) {
                _that.element.blur();
            }
        }
        //create the autocomplete
        this._super();
        //in case we are categorizing, the category is not a selectable choice
        this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
    },
    //creates category menu items if this is categorized
    _renderMenu: function (ul, items) {
        var that = this,
          currentCategory = "";
        $.each(items, function (index, item) {
            if (item[that.options.categoryfield] != currentCategory && that.options.categorize) {
                ul.append("<li class='ui-autocomplete-category'>" + item[that.options.categoryfield] + "</li>");
                currentCategory = item[that.options.categoryfield];
            }
            that._renderItemData(ul, item);
        });
    },
    _setOption: function (key, value) {
        //user is not allowed to mess with these
        if (key === "source" || key === "change" || key === "select" || key === "filtereddatasource") {
            return;
        }
        //!!!!!!!!!!!!!!!!!!! HEY! Handle change of these later....
        //for now, user is not allowed to change them after creation
        if (key === "filter" || key === "defaultvalue" || key === "autodrop" || key === "minLength" || key === "categorize") {
            return;
        }
        if (key === "datasource") {
            this._super(key, value);
            this._definefiltereddatasource();
            this.selectitem(this.options.defaultvalue);
            this._definesource();
            return;
        }
        this._super(key, value);
    },
/*
    private, custom methods
*/
    _definefiltereddatasource: function () {
        var _that = this;
        if (this.options.filter.length > 0) {
            this.options.filtereddatasource = $.grep(this.options.datasource, function (element, index) {
                return _that._compareObjectKeys(element, _that.options.filter);
            });
        } else {
            this.options.filtereddatasource = $.extend(true, [], this.options.datasource);
        }
    },
/*
    setup the source and match based on the defined filter,  
    seach fields and number of items to show in the drop down
    defaults to matching the label element
*/
    _definesource: function () {
        var _that = this;
        this.options.source = function (request, response) {
            var _matchterm = "";
            var results = $.grep(this.options.filtereddatasource, function (element, index) {
                _matchterm = element.label;
                if (_that.options.searchfields.length > 0) {
                    _matchterm = "";
                    $.each(_that.options.searchfields, function (i, e) {
                        _matchterm += element[e] + " ";
                    });
                }
                return (_matchterm).toUpperCase().indexOf(request.term.toUpperCase()) != -1;
            });
            if (this.options.itemsshown > 0) {
                response(results.slice(0, this.options.itemsshown));
            } else {
                response(results);
            }
        }
    },
/*
    compares an object to each object in an array of objects
    returns true if the object contains a matched set of elements from
    any of the objects in the array - used for filtering
*/
    _compareObjectKeys: function (element, set) {
        var filterlength = set.length;
        for (var i = 0; i < filterlength; i++) {
            var thisone = true;
            for (var property in set[i]) {
                if (set[i].hasOwnProperty(property)) {
                    if (element[property] != set[i][property]) {
                        thisone = false;
                    }
                }
            }
            if (thisone == true) {
                return true;
            }
        }
        return false;
    }
});