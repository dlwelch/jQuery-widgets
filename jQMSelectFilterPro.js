/*
jQMSelectFilterPro 0.0
https://github.com/dlwelch/jQuery-widgets
Copyright © 2015 Dedra L. Welch 
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
$.widget("custom.jqmselectfilterpro", {
    options: {
        searchprompt: null,
        maxitems: 0,
        categoryfield: null,
        filterReveal: false,
        source: null,
        searchfields: [],
        defaultvalue: []
    },
    _selectedvalue: null,
    _visibleitems: 0,
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
     remember, we really don't care about the value of the select
     so no need to fire the select event
   */
    selectitem: function (item) {
        if ($.isArray(item)) {
            var _that = this;
            var myItem = $.grep(this.options.source.items, function (element, index) {
                return _that._compareObjectKeys(element, item);
            });
            if (myItem.length > 0) {
                this.element.val(myItem[0].label);
                $(this.element).find("option:first").html(myItem[0].label);
                this._selectedvalue = myItem[0];
            }
            else {
                this.element.val(this.options.searchprompt);
                $(this.element).find("option:first").html(this.options.searchprompt);
                this._selectedvalue = null;
            }
        }
    },
    _create: function () {
        var _that = this;

        //add the prompt/title option
        var promptoption = document.createElement("option");
        $(promptoption).html(_that.options.searchprompt);
        _that.element.append(promptoption);

        //add the source options to the target select
        //use categories if defined
        var currentCategory = "";
        var currentCategoryOptgroup;
        $.each(_that.options.source.items, function (index, item) {
            if (item["category"] != currentCategory && _that.options.categoryfield != null) {
                currentCategoryOptgroup = document.createElement("optgroup");
                $(currentCategoryOptgroup).attr("label", item["category"]);
                _that.element.append(currentCategoryOptgroup);
                currentCategory = item["category"];
            }

            var thisoption = document.createElement("option");
            $(thisoption).attr("value", index)
                .html(item["label"])
                .attr("data-filtertext", _that._getfiltertext(item))
                .addClass("jqmselectfilterprosearchable");
            if (_that.options.categoryfield != null) {
                $(currentCategoryOptgroup).append(thisoption);
            } else {
                _that.element.append(thisoption);
            }
        });
        this.selectitem(this.options.defaultvalue);

        this.element.on("selectmenucreate", function (event) {

            // FROM jQM demo: "Upon creation of the select menu, we want to make use of the fact that the ID of the
            //                listview it generates starts with the ID of the select menu itself, plus the suffix '-menu'.
            //                We retrieve the listview and insert a search input before it."
            var input,
            selectmenu = $(event.target),
            list = $("#" + selectmenu.attr("id") + "-menu"),
            // FROM jQM demo: "We store the generated form in a variable attached to the popup so we avoid creating a
            //                 second form/input field when the listview is destroyed/rebuilt during a refresh."
            form = list.jqmData("filter-form");
            if (!form) {
                input = $("<input data-type='search'></input>");
                form = $("<form style='padding-bottom:1em;'></form>").append(input);
                input.textinput();
                list
                .before(form)
                .jqmData("filter-form", form);
                form.jqmData("listview", list);
            }

            _that.element.on("change", function (event) {
                //set this jqmselectfilterpro's current value
                _that._selectedvalue = _that.options.source.items[selectmenu.find(":selected").attr("value")];
                //update the select element's first option to refect the current selection
                //so it will be used as the title while filtering
                $(this).find("option:first").html(_that._selectedvalue.label);
            });

            //The following code is used when selectmenu opens a popup instead of a dialog (page)
            $("#" + selectmenu.attr("id") + "-listbox").on("popupbeforeposition", function (event, uiempty) {
                //update the title of the popup to the currently selected label
                $(this).find("h1").html(selectmenu.find(":selected").text());
                // if using option categories, un-highlight the li since it won't follow correctly (the jquery selectmenu filterable doesn't do it right...)
                if (_that.options.categoryfield != null)
                    $(this).find("ul").find("[aria-selected='true']").attr("aria-selected", false).find("a").removeClass("ui-btn-active");

            });
            //set the focus to the input search box in the popup when it opens
            $("#" + _that.element.attr("id") + "-listbox-popup").on("popupafteropen", function () {
                $('input').focus();
            });

            //The following code is used when selectmenu opens a dialog (page) instead of a popup
            //but from JQM:
            //   Note: The behavior whereby the custom select menu creates a new page when the list of options is long
            //   is deprecated as of jQuery Mobile 1.4.0. Starting with 1.5.0, the custom select menu will fall back to
            //   utilizing the select menu's native behavior when the list of options is too long.
            //so, this code will eventually be dead and should have no effect.
            //however, we'll need to see what happens with the native behavior and modify this widget accordingly
            //maybe we can have a default max on the maxitems to prevent reverting to the native
            //or we could override the reverting.... ?
            $.mobile.document
                 //  FROM jQM demo: "The custom select list may show up as either a popup or a dialog, depending on how much
                 //    vertical room there is on the screen. If it shows up as a dialog, then the form containing
                 //    the filter input field must be transferred to the dialog so that the user can continue to"
                 //    use it for filtering list items.
                .on("pagecontainerbeforeshow", function (event, data) {
                    // Only handle the appearance of a dialog generated for THIS filterable selectmenu
                    if (data.toPage.attr("id") == _that.element.attr("id") + "-dialog") {
                        var listview, form;
                        listview = data.toPage.find("ul");
                        form = listview.jqmData("filter-form");
                        // FROM jQM demo: "Attach a reference to the listview as a data item to the dialog, because during the
                        //    pagecontainerhide handler below the selectmenu widget will already have returned the
                        //    listview to the popup, so we won't be able to find it inside the dialog with a selector."
                        data.toPage.jqmData("listview", listview);
                        // FROM jQM demo: "Place the form before the listview in the dialog."
                        listview.before(form);

                        // un-highlight the li since it won't follow correctly if using option categories (the jquery selectmenu filterable doesn't do it right...)
                        if (_that.options.categoryfield != null)
                            listview.find("li[aria-selected='true']").attr("aria-selected", false).find("a").removeClass("ui-btn-active");
                        //update the title of the dialog to the currently selected label
                        data.toPage.find("div.ui-title").html($("#" + _that.element.attr("id")).find(":selected").text());
                    }
                })
                .on("pagecontainerhide", function (event, data) {
                    if (data.prevPage.attr("id") == _that.element.attr("id") + "-dialog") {
                        var listview, form;
                        listview = data.prevPage.jqmData("listview"),
                        form = listview.jqmData("filter-form");
                        // FROM jQM demo: "Put the form back in the popup. It goes ahead of the listview."
                        listview.before(form);
                    }
                })
                .on("pagecontainershow", function (event, data) {
                    //set the focus to the input search box in the dialog page when it is active
                    if (data.toPage.attr("id") == _that.element.attr("id") + "-dialog") {
                        $('input').focus();
                    }
                });

            selectmenu
            .filterable({
                input: input,
                //normally, we would search all the options and/or groups
                //children: "> option, > optgroup option",
                //but we will only search the options with the right class
                children: ".jqmselectfilterprosearchable",
                filterCallback: function (index, searchValue) {
                    ////this is the normal default filterCallback which returns true to hide the current item
                    //return (("" + ($.mobile.getAttribute(this, "filtertext") || $(this).text())).toLowerCase().indexOf(searchValue) === -1);

                    //but we are going to customize it so we'll only show maxitems if that option has been set > 0
                    //and to do a filterReveal if that option is set to true

                    //if we've reached our maxitems limit
                    //or if we have no search term (reveal) then hide this item
                    if (((_that.options.maxitems > 0) && (_that._visibleitems >= _that.options.maxitems)) || (_that.options.filterReveal && searchValue == "")) {
                        return true;
                    } else {
                        var hide = (("" + ($.mobile.getAttribute(this, "filtertext") || $(this).text())).toLowerCase().indexOf(searchValue) === -1);
                        //keep track of how many items have been matched.
                        if (!hide) {
                            _that._visibleitems = _that._visibleitems + 1
                        };
                        return hide;
                    }
                }
            }).on("filterablebeforefilter", function () {
                //reset the current number of visible items
                _that._visibleitems = 0;
            }).on("filterablefilter", function () {
                // un-highlight the li since it won't follow correctly if using option categories (the jquery selectmenu filterable doesn't do it right...)
                if (_that.options.categoryfield != null) {
                    $("#" + selectmenu.attr("id") + "-listbox").find("li[aria-selected='true']").attr("aria-selected", false).find("a").removeClass("ui-btn-active");
                    $("#" + _that.element.attr("id") + "-dialog").find("li[aria-selected='true']").attr("aria-selected", false).find("a").removeClass("ui-btn-active");
                }
            });

        });

        this.element.selectmenu();
        
    },
    _getfiltertext: function (element) {

        var _matchterm = "";
        $.each(this.options.searchfields, function (i, e) {
            _matchterm += element[e];
        });
        return _matchterm;
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
