/**
 * @namespace App
 * */
var App = (function(){
    return {
        oldHue: -1,
        initialised: false,
        pbBar: null,
        pbInfo: null,
        pbRemaining: null,
        headerInfo: null,
        boxBackground: null,

        // initial values
        workStartHour: 8,
        workEndHour: 17,

        dateTimeNow: null,
        startDateTime: null,
        endDateTime: null,

        startSpanMs: null,
        endSpanMs: null,

        start: function() {
            this.clockWork();
        },

        // functions
        getStartDateTime: function (dateTime){
            return this.getTestDateTime(dateTime.clone(), this.workStartHour);
        },

        getEndDateTime: function (dateTime){
            return this.getTestDateTime(dateTime.clone(), this.workEndHour);
        },

        getTestDateTime: function (dateTime, testHour){
            var hour = dateTime.hour();

            if (hour >= this.workEndHour){
                dateTime.add(1, 'days');
            }

            var weekDay = dateTime.isoWeekday();

            if (weekDay == 7){ // 0 - Sunday
                dateTime.add(1, 'days');
            }
            else if (weekDay == 6){ // 6 - Saturday
                dateTime.add(2, 'days');
            }

            return moment({year: dateTime.year(), month:dateTime.month(), day:dateTime.date(), hour:testHour});
        },

        test: function(dateString) {
            var now = moment(dateString || '2016-03-10 23:01:01');
            console.log('Now date: ' + now.format());

            var start = this.getStartDateTime(now);
            console.log('Start date: ' + start.format());
            var end = this.getEndDateTime(now);
            console.log('End date: ' + end.format());

            var startSpanMs = moment.duration(start.diff(now));
            var endSpanMs = moment.duration(end.diff(now));

            if (this.waitingToEnd(startSpanMs, endSpanMs)) {
                // waiting for end
                console.log('Waiting for end ' + endSpanMs.humanize());
            }
            else {
                // waiting for start
                console.log('Waiting for start ' + startSpanMs.humanize());
            }
        },

        waitingToEnd: function(startSpan, endSpan) {
            if (startSpan.asMilliseconds() < 0) {
                // waiting for end
                return true;
            }
            else {
                // waiting for start
                return false;
            }
        },

        updateTime: function (){
            this.dateTimeNow = moment();
            //this.dateTimeNow = moment('2016-03-10 23:01:01');

            this.startDateTime = this.getStartDateTime(this.dateTimeNow);
            this.endDateTime = this.getEndDateTime(this.dateTimeNow);

            this.startSpanMs = moment.duration(this.startDateTime.diff(this.dateTimeNow));
            this.endSpanMs = moment.duration(this.endDateTime.diff(this.dateTimeNow));
        },

        initElements: function (){
            if (!this.initialised){
                this.pbBar = $('#pbBar');
                this.pbInfo = $('#pbInfo');
                this.pbRemaining = $('#pbRemaining');
                this.headerInfo = $('#headerInfo');
                this.boxBackground = $('#boxBackground');

                if (this.pbBar && this.pbInfo && this.pbRemaining && this.headerInfo && this.boxBackground) {
                    this.initialised = true;
                }
            }

            return this.initialised;
        },

        updateBackground: function (){
            var hue = this.startSpanMs.asMinutes() % 360;
            //hue = Math.floor(Math.random()*360);
            //console.log('Minute Hue: ' + hue);

            if (this.oldHue !=  hue){
                this.oldHue = hue;

                this.boxBackground.css({ 'background': 'hsl(' + hue + ',49%,55%)'});
                this.boxBackground.css({ 'background': '-moz-radial-gradient(center, ellipse cover,  hsl(' + hue + ',49%,55%) 0%, hsl(' + hue + ',64%,45%) 100%)'});
                this.boxBackground.css({ 'background': '-webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(0%,hsl(' + hue + ',49%,55%)), color-stop(100%,hsl(' + hue + ',64%,45%)))'});
                this.boxBackground.css({ 'background': '-webkit-radial-gradient(center, ellipse cover,  hsl(' + hue + ',49%,55%) 0%,hsl(' + hue + ',64%,45%) 100%)'});
                this.boxBackground.css({ 'background': '-o-radial-gradient(center, ellipse cover,  hsl(' + hue + ',49%,55%) 0%,hsl(' + hue + ',64%,45%) 100%)'});
                this.boxBackground.css({ 'background': '-ms-radial-gradient(center, ellipse cover,  hsl(' + hue + ',49%,55%) 0%,hsl(' + hue + ',64%,45%) 100%)'});
                this.boxBackground.css({ 'background': 'radial-gradient(center, ellipse cover,  hsl(' + hue + ',49%,55%) 0%,hsl(' + hue + ',64%,45%) 100%)'});
            }
        },

        getTimeSpanString: function(timeSpan){
            return [pad(Math.floor(timeSpan.asHours())), pad(timeSpan.minutes()), pad(timeSpan.seconds())].join(':');
            function pad(number) {
                var str = '' + number;
                while (str.length < 2) {
                    str = '0' + str;
                }

                return str;
            }
        },

        clockWork: function () {
            this.updateTime();

            if (this.initElements()) {
                if (this.waitingToEnd(this.startSpanMs, this.endSpanMs)) {
                    // waiting for end
                    this.pbRemaining.text(this.getTimeSpanString(this.endSpanMs));

                    var span = moment.duration(this.endDateTime.diff(this.startDateTime));
                    var procWorkStop = (this.endSpanMs.asMilliseconds() / Math.abs(span.asMilliseconds()) * 100);

                    this.pbInfo.html(Math.floor(procWorkStop).toString() + '%'); // Remaining work
                    this.pbBar.css('width', Math.floor(procWorkStop).toString() + '%');
                    this.headerInfo.text('Time remaining till the end of the work');

                }
                else {
                    // waiting for start
                    this.pbRemaining.text(this.getTimeSpanString(this.startSpanMs));
                    this.pbInfo.text('Hey, kick back!');
                    this.pbBar.css('width', '0%');
                    this.headerInfo.text('Time remaining till the start of the work');
                }

                document.title = this.pbRemaining.text() + ' ' + this.headerInfo.text();

                this.updateBackground();
            }

            setTimeout($.proxy(this.clockWork, this), 1000);

            return this;
        }
    };
})();