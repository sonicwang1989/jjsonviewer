!function ($) {

    'use strict';

    $.fn.jsonViewer = function (json, options) {
        return this.each(function () {
            var self = $(this);
            if (typeof json == 'string') {
                self.data('json', json);
            }
            else if (typeof json == 'object') {
                self.data('json', JSON.stringify(json))
            }
            else {
                self.data('json', '');
            }
            new JsonViewer(self, options);
        });
    };

    function JsonViewer(self, options) {
        var plugin = this;
        self.html('<ul class="json-view-container"></ul>');
        try {
            var json = $.parseJSON(self.data('json'));
            options = $.extend({}, this.defaults, options);
            plugin.options = options;
            var expanderClasses = plugin.getExpanderClasses(plugin.options.expanded);
            self.find('.json-view-container').append(plugin.json2html([json], expanderClasses));
        } catch (e) {
            self.prepend('<div class="json-error" >' + e.toString() + ' </div>');
            self.find('.json-view-container').append(self.data('json'));
        }
    }

    JsonViewer.prototype.getExpanderClasses = function (expanded) {
        if (!expanded) return 'expanded collapsed hidden';
        return 'expanded';
    }

    JsonViewer.prototype.json2html = function (json, expanderClasses) {
        var plugin = this;
        var html = '';
        for (var key in json) {
            if (!json.hasOwnProperty(key)) {
                continue;
            }

            var value = json[key],
                type = typeof json[key];

            html = html + plugin.createElement(key, value, type, expanderClasses);
        }
        return html;
    }

    JsonViewer.prototype.encode = function (value) {
        return $('<div/>').text(value).html();
    }

    JsonViewer.prototype.createElement = function (key, value, type, expanderClasses) {
        var plugin = this;
        var klass = 'object',
            open = '{',
            close = '}';
        if ($.isArray(value)) {
            klass = 'array';
            open = '[';
            close = ']';
        }
        var key = '<span class="key">' + plugin.encode(key) + ' :</span>';
        if (plugin.options.keyQuotes) {
            key = '<span class="key">"' + plugin.encode(key) + '" :</span>';
        }

        if (value === null) {
            return '<li>' + key + '<span class="null">null</span></li>';
        }
        if (type == 'object') {
            var object = '<li><span class="' + expanderClasses + '"></span>' + key + ' <span class="open">' + open + '</span> <ul class="' + klass + '">';
            object = object + plugin.json2html(value, expanderClasses);
            return object + '</ul><span class="close">' + close + '</span></li>';
        }
        if (type == 'number' || type == 'boolean') {
            return '<li>' + key + '<span class="' + type + '">' + plugin.encode(value) + '</span></li>';
        }
        return '<li>' + key + '<span class="' + type + '">"' + plugin.encode(value) + '"</span></li>';
    }

    $(document).on('click', '.json-view-container .expanded', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $self = $(this);
        $self.parent().find('>ul').slideUp(100, function () {
            $self.addClass('collapsed');
        });
    });

    $(document).on('click', '.json-view-container .expanded.collapsed', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $self = $(this);
        $self.removeClass('collapsed').parent().find('>ul').slideDown(100, function () {
            $self.removeClass('collapsed').removeClass('hidden');
        });
    });

    JsonViewer.prototype.defaults = {
        expanded: true,  //expand or not default
        keyQuotes: false //add quotes to the key
    };

}(window.jQuery);
