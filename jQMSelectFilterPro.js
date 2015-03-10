/* 
autocompletepro 0.0
https://github.com/dlwelch/jQuery-widgets
Copyright © 2014 Dedra L. Welch 
Licensed MIT
*/
$.widget("custom.jqmselectfilterpro", {
    options: { searchprompt: null, maxitems: 0, categoryfield: null, filterReveal: !1, source: null, searchfields: [], defaultvalue: [] }, _selectedvalue: null, value: function () { return "undefined" === $.type(this._selectedvalue) ? null : this._selectedvalue }, _visibleitems: 0, _create: function () {
        var a = this, j = document.createElement("option"); $(j).html(a.options.searchprompt); a.element.append(j); var k = "", g; $.each(a.options.source.items, function (e, c) {
            c.category != k && null != a.options.categoryfield &&
            (g = document.createElement("optgroup"), $(g).attr("label", c.category), a.element.append(g), k = c.category); var b = document.createElement("option"); $(b).attr("value", e).html(c.label).attr("data-filtertext", c.category + c.label).addClass("jqmselectfilterprosearchable"); null != a.options.categoryfield ? $(g).append(b) : a.element.append(b)
        }); this.element.on("selectmenucreate", function (e) {
            var c, b = $(e.target); e = $("#" + b.attr("id") + "-menu"); var f = e.jqmData("filter-form"); f || (c = $("<input data-type='search'></input>"),
            f = $("<form style='padding-bottom:1em;'></form>").append(c), c.textinput(), e.before(f).jqmData("filter-form", f), f.jqmData("listview", e)); a.element.on("change", function () { a._selectedvalue = a.options.source.items[b.find(":selected").attr("value")]; $(this).find("option:first").html(a._selectedvalue.label) }); $("#" + b.attr("id") + "-listbox").on("popupbeforeposition", function () {
                $(this).find("h1").html(b.find(":selected").text()); null != a.options.categoryfield && $(this).find("ul").find("[aria-selected='true']").attr("aria-selected",
                !1).find("a").removeClass("ui-btn-active")
            }); $("#" + a.element.attr("id") + "-listbox-popup").on("popupafteropen", function () { $("input").focus() }); $.mobile.document.on("pagecontainerbeforeshow", function (c, h) {
                if (h.toPage.attr("id") == a.element.attr("id") + "-dialog") {
                    var d, b; d = h.toPage.find("ul"); b = d.jqmData("filter-form"); h.toPage.jqmData("listview", d); d.before(b); null != a.options.categoryfield && d.find("li[aria-selected='true']").attr("aria-selected", !1).find("a").removeClass("ui-btn-active"); h.toPage.find("div.ui-title").html($("#" +
                    a.element.attr("id")).find(":selected").text())
                }
            }).on("pagecontainerhide", function (b, c) { if (c.prevPage.attr("id") == a.element.attr("id") + "-dialog") { var d, e; d = c.prevPage.jqmData("listview"); e = d.jqmData("filter-form"); d.before(e) } }).on("pagecontainershow", function (c, b) { b.toPage.attr("id") == a.element.attr("id") + "-dialog" && $("input").focus() }); b.filterable({
                input: c, children: ".jqmselectfilterprosearchable", filterCallback: function (c, b) {
                    if (0 < a.options.maxitems && a._visibleitems >= a.options.maxitems || a.options.filterReveal &&
                    "" == b) return !0; var d = -1 === ("" + ($.mobile.getAttribute(this, "filtertext") || $(this).text())).toLowerCase().indexOf(b); d || (a._visibleitems += 1); return d
                }
            }).on("filterablebeforefilter", function () { a._visibleitems = 0 }).on("filterablefilter", function () { null != a.options.categoryfield && ($("#" + b.attr("id") + "-listbox").find("li[aria-selected='true']").attr("aria-selected", !1).find("a").removeClass("ui-btn-active"), $("#" + a.element.attr("id") + "-dialog").find("li[aria-selected='true']").attr("aria-selected", !1).find("a").removeClass("ui-btn-active")) })
        });
        this.element.selectmenu()
    }
});
