/*
 * Checking in as there is no npm module to consume. 
 * Current version is 2.15.
 * Repo - https://github.com/TypingDNA/TypingDnaRecorder-JavaScript
 */

/**
 * TypingDNA - Typing Biometrics JavaScript API
 * https://api.typingdna.com/scripts/typingdna.js
 * https://typingdna.com/scripts/typingdna.js (alternative)
 *
 * @version 2.15
 * @author Raul Popa
 * @copyright SC TypingDNA SRL, http://typingdna.com
 * @license http://www.apache.org/licenses/LICENSE-2.0
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Typical usage:
 * var tdna = new TypingDNA(); // creates a new TypingDNA object and starts recording
 * var typingPattern = tdna.getTypingPattern({type=1, text="Hello5g21?*"});
 * returns a type 1 typing pattern (and continues recording afterwards)
 *
 * Optional:
 * tdna.stop(); // ends recording and clears history stack (returns recording flag: false)
 * tdna.start(); // restarts the recording after a stop (returns recording flag: true)
 * tdna.reset(); // restarts the recording anytime, clears history stack and starts from scratch (returns nothing)
 * var typingPatternQuality = TypingDNA.getQuality(typingPattern); //returns the quality/strength of any typing pattern
 * (there is no need to initialize the class to do pattern quality checking)
 */

/**
 * Creates a single instance (or a reference) of the TypingDNA class
 * @return {Object} Returns the single instance of the TypingDNA class.
 * @example var tdna = new TypingDNA();
 */
module.exports = function TypingDNA() {
  if (TypingDNA.initialized != true) {
    TypingDNA.prototype.start = function() {
      return TypingDNA.start.apply(this, arguments);
    }
    TypingDNA.prototype.stop = function() {
      return TypingDNA.stop.apply(this, arguments);
    }
    TypingDNA.prototype.reset = function() {
      return TypingDNA.reset.apply(this, arguments);
    }
    TypingDNA.prototype.addTarget = function() {
      return TypingDNA.addTarget.apply(this, arguments);
    }
    TypingDNA.prototype.removeTarget = function() {
      return TypingDNA.removeTarget.apply(this, arguments);
    }
    TypingDNA.prototype.getTypingPattern = function() {
      return TypingDNA.getTypingPattern.apply(this, arguments);
    }
    TypingDNA.prototype.get = function() {
      // still works but will be deprecated in favor of getTypignPattern()
      return TypingDNA.get.apply(this, arguments);
    }
    TypingDNA.prototype.startDiagram = function() {
      // deprecated in favor of start()
      //return TypingDNA.startDiagram.apply(this, arguments);
    }
    TypingDNA.prototype.stopDiagram = function() {
      // deprecated in favor of stop()
      //return TypingDNA.stopDiagram.apply(this, arguments);
    }
    TypingDNA.prototype.getDiagram = function() {
      // still works but will be deprecated in favor of getTypignPattern()
      return TypingDNA.getDiagram.apply(this, arguments);
    }
    TypingDNA.prototype.getExtendedDiagram = function() {
      // still works but will be deprecated in favor of getTypignPattern()
      return TypingDNA.getExtendedDiagram.apply(this, arguments);
    }
    TypingDNA.prototype.getMouseDiagram = function() {
      return TypingDNA.getMouseDiagram.apply(this, arguments);
    }
    TypingDNA.prototype.startMouse = function() {
      return TypingDNA.startMouse.apply(this, arguments);
    }
    TypingDNA.prototype.stopMouse = function() {
      return TypingDNA.stopMouse.apply(this, arguments);
    }
    TypingDNA.prototype.getQuality = function() {
      return TypingDNA.getQuality.apply(this, arguments);
    }
    TypingDNA.prototype.getLength = function() {
      return TypingDNA.getLength.apply(this, arguments);
    }
    TypingDNA.prototype.isMobile = function() {
      return TypingDNA.isMobile.apply(this, arguments);
    }
    TypingDNA.prototype.getTextId = function() {
      return TypingDNA.getTextId.apply(this, arguments)
    }
    TypingDNA.initialized = true;
    TypingDNA.prototype.maxHistoryLength = TypingDNA.maxHistoryLength;
    TypingDNA.prototype.defaultHistoryLength = TypingDNA.defaultHistoryLength;
    TypingDNA.prototype.maxSeekTime = TypingDNA.maxSeekTime;
    TypingDNA.prototype.maxPressTime = TypingDNA.maxPressTime;
    TypingDNA.version = 2.15;
    TypingDNA.flags = 0;
    TypingDNA.instance = this;
    TypingDNA.document = document;
    TypingDNA.maxHistoryLength = 2000;
    TypingDNA.maxSeekTime = 1500;
    TypingDNA.maxPressTime = 300;
    TypingDNA.defaultHistoryLength = 160;
    TypingDNA.spKeyCodes = [8, 13, 32];
    TypingDNA.spKeyCodesObj = {
      8: 1,
      13: 1,
      32: 1
    };
    TypingDNA.keyCodes = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 32, 222, 188, 190, 186, 187, 189, 191, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
    TypingDNA.keyCodesObj = {}
    for (var i in TypingDNA.keyCodes) {
      TypingDNA.keyCodesObj[TypingDNA.keyCodes[i]] = 1;
    }
    TypingDNA.pt1 = TypingDNA.ut1 = (new Date).getTime();
    TypingDNA.wfk = [];
    TypingDNA.sti = [];
    TypingDNA.skt = [];
    TypingDNA.recording = true;
    TypingDNA.mouseRecording = true;
    TypingDNA.mouseMoveRecording = false;
    TypingDNA.spKeyRecording = true;
    TypingDNA.diagramRecording = true;
    TypingDNA.dwfk = [];
    TypingDNA.dsti = [];
    TypingDNA.dskt = [];
    TypingDNA.drkc = [];
    TypingDNA.dlastDownKey;
    TypingDNA.prevKeyCode = 0;
    TypingDNA.maxMoveDeltaTime = 600;
    TypingDNA.maxScrollDeltaTime = 800;
    TypingDNA.maxStopTime = 1500;
    TypingDNA.maxClickTime = 600;
    TypingDNA.maxMouseHistoryLength = 500;
    TypingDNA.lastMouseMoveTime = TypingDNA.lastMouseDownTime = (new Date).getTime();
    TypingDNA.stopTimes = [];
    TypingDNA.clickTimes = [];
    TypingDNA.lastMouseStop = true;
    TypingDNA.zl = 0.0000001;
    TypingDNA.isAndroidChrome = false;
    TypingDNA.ACLastTime = (new Date).getTime();
    TypingDNA.ACSeekTime = 0;
    TypingDNA.ACPressTime = 0;
    TypingDNA.ACLastCharCode = 0;
    TypingDNA.ACLastKeyCode = 0;
    TypingDNA.ACInputLengths = {
      inputs: [],
      lastLength: [],
    };
    TypingDNA.ACPreviousKeyCode = 0;
    TypingDNA.targetIds = [];
    TypingDNA.lastTarget = "";
    TypingDNA.lastTargetFound = false;
    TypingDNA.replaceMissingKeys = true;
    TypingDNA.replaceMissingKeysPerc = 7;

    TypingDNA.keyDown = function(e) {
      if (!TypingDNA.recording && !TypingDNA.diagramRecording) {
        return;
      }
      if (!TypingDNA.isTarget(e.target.id)) {
        return;
      }
      var keyCode = e.keyCode;
      if (TypingDNA.wfk[keyCode] == 1 || TypingDNA.dwfk[keyCode] == 1) {
        //return;
      }
      if (keyCode == 229 && TypingDNA.isMobile() && !TypingDNA.isAndroidChrome) {
        TypingDNA.isAndroidChrome = true;

        TypingDNA.ACSeekTime = (new Date).getTime() - TypingDNA.ACLastTime;
        TypingDNA.ACLastTime = (new Date).getTime();

        TypingDNA.document.removeEventListener("keydown", TypingDNA.keyDown);
        TypingDNA.document.removeEventListener("keyup", TypingDNA.keyUp);
        TypingDNA.document.removeEventListener("keypress", TypingDNA.keyPress);

        // if android
        TypingDNA.document.addEventListener("keydown", TypingDNA.ACKeyDown);
        TypingDNA.document.addEventListener("keyup", TypingDNA.ACKeyUp);
      } else {
        var t0 = TypingDNA.pt1;
        TypingDNA.pt1 = (new Date).getTime();
        var seekTotal = TypingDNA.pt1 - t0;
        var startTime = TypingDNA.pt1;
        if (TypingDNA.recording == true || (TypingDNA.spKeyCodesObj[keyCode] && TypingDNA.spKeyRecording == true)) {
          if (!e.shiftKey || TypingDNA.isMobile()) {
            TypingDNA.wfk[keyCode] = 1;
            TypingDNA.skt[keyCode] = seekTotal;
            TypingDNA.sti[keyCode] = startTime;
          }
        }
        if (TypingDNA.diagramRecording == true) {
          TypingDNA.dwfk[keyCode] = 1;
          TypingDNA.dskt[keyCode] = seekTotal;
          TypingDNA.dsti[keyCode] = startTime;
          TypingDNA.dlastDownKey = keyCode;
        }
      }
    }

    TypingDNA.keyPress = function(e) {
      if (!TypingDNA.recording && !TypingDNA.diagramRecording) {
        return;
      }
      if (!TypingDNA.isTarget(e.target.id)) {
        return;
      }
      if (TypingDNA.diagramRecording == true) {
        var keyCode = TypingDNA.dlastDownKey;
        TypingDNA.drkc[keyCode] = e.charCode;
      }
    }

    TypingDNA.keyUp = function(e) {
      if (!TypingDNA.recording && !TypingDNA.diagramRecording) {
        return;
      }
      if (!TypingDNA.isTarget(e.target.id)) {
        return;
      }
      var ut = (new Date).getTime();
      var keyCode = e.keyCode;
      if (TypingDNA.recording == true || (TypingDNA.spKeyCodesObj[keyCode] && TypingDNA.spKeyRecording == true)) {
        if (!e.shiftKey || TypingDNA.isMobile()) {
          if (TypingDNA.wfk[keyCode] == 1) {
            var pressTime = ut - TypingDNA.sti[keyCode];
            var seekTime = TypingDNA.skt[keyCode];
            var arr = [keyCode, seekTime, pressTime, TypingDNA.prevKeyCode, ut, e.target.id];
            TypingDNA.history.add(arr);
            TypingDNA.prevKeyCode = keyCode;
          }
        }
        TypingDNA.wfk[keyCode] = 0;
      }
      if (TypingDNA.diagramRecording == true) {
        if (TypingDNA.drkc[keyCode] != undefined && TypingDNA.drkc[keyCode] != 0) {
          if (TypingDNA.dwfk[keyCode] == 1) {
            var pressTime = ut - TypingDNA.dsti[keyCode];
            var seekTime = TypingDNA.dskt[keyCode];
            var realKeyCode = TypingDNA.drkc[keyCode];
            var arrD = [keyCode, seekTime, pressTime, realKeyCode, ut, e.target.id];
            TypingDNA.history.addDiagram(arrD);
          }
        }
        TypingDNA.dwfk[keyCode] = 0;
      }
    }

    TypingDNA.mouseScroll = function(e) {
      if (TypingDNA.mouseRecording == true) {
        if (TypingDNA.mouseMoveRecording == true) {
          if (TypingDNA.mouse.scrollStarted == true) {
            var currentTime = (new Date).getTime();
            TypingDNA.mouse.scrollTimes.push(currentTime);
            TypingDNA.mouse.scrollTopArr.push(TypingDNA.document.body.scrollTop);
            clearInterval(TypingDNA.scrollInterval);
            TypingDNA.scrollInterval = setInterval(TypingDNA.mouse.checkScroll, TypingDNA.maxScrollDeltaTime);
          } else {
            TypingDNA.mouse.scrollStarted = true
          }
        }
      }
    }

    TypingDNA.mouseMove = function(e) {
      if (TypingDNA.mouseRecording == true) {
        var currentTime = (new Date).getTime();
        if (TypingDNA.mouseMoveRecording == true) {
          if (TypingDNA.mouse.started == true) {
            TypingDNA.mouse.times.push(currentTime);
            TypingDNA.mouse.xPositions.push(e.screenX);
            TypingDNA.mouse.yPositions.push(e.screenY);
            clearInterval(TypingDNA.moveInterval);
            TypingDNA.moveInterval = setInterval(TypingDNA.mouse.checkMove, TypingDNA.maxMoveDeltaTime);
          } else {
            TypingDNA.mouse.started = true;
          }
        }
        TypingDNA.lastMouseMoveTime = currentTime;
      }
    }

    TypingDNA.mouseDown = function(e) {
      if (TypingDNA.mouseRecording == true) {
        TypingDNA.mouse.checkMove();
        TypingDNA.mouse.checkScroll();
        if (e.which == 1) {
          TypingDNA.lastMouseDownTime = (new Date).getTime();
          var stopTime = TypingDNA.lastMouseDownTime - TypingDNA.lastMouseMoveTime;
          if (stopTime < TypingDNA.maxStopTime && TypingDNA.lastMouseStop == false) {
            TypingDNA.stopTimes.push(stopTime);
            if (TypingDNA.mouseMoveRecording == true) {
              var eventType = 3;
              var arr = [eventType, stopTime];
              TypingDNA.mouse.history.add(arr);
              TypingDNA.lastMouseStop = true;
            }
          }
        }
      }
    }

    TypingDNA.mouseUp = function(e) {
      if (TypingDNA.mouseRecording == true) {
        if (e.which == 1) {
          var clickTime = (new Date).getTime() - TypingDNA.lastMouseDownTime;
          if (clickTime < TypingDNA.maxClickTime && TypingDNA.lastMouseDownTime > TypingDNA.lastMouseMoveTime) {
            TypingDNA.clickTimes.push(clickTime);
            if (TypingDNA.mouseMoveRecording == true) {
              var eventType = 4;
              var arr = [eventType, clickTime];
              TypingDNA.mouse.history.add(arr);
            }
          }
        }
      }
    }

    TypingDNA.ACKeyDown = function(e) {
      if (!TypingDNA.recording && !TypingDNA.diagramRecording) {
        return;
      }
      TypingDNA.ACSeekTime = (new Date).getTime() - TypingDNA.ACLastTime;
      TypingDNA.ACLastTime = (new Date).getTime();
      if (!TypingDNA.isTarget(e.target.id)) {
        return;
      }
      if(TypingDNA.ACInputLengths.inputs.indexOf(e.target) === -1) {
        TypingDNA.ACInputLengths.inputs.push(e.target);
        TypingDNA.ACInputLengths.lastLength.push(0);
      }
    }

    TypingDNA.ACKeyUp = function(e) {
      if (!TypingDNA.recording && !TypingDNA.diagramRecording) {
        return;
      }
      TypingDNA.ACPressTime = (new Date).getTime() - TypingDNA.ACLastTime;
      TypingDNA.ACLastTime = (new Date).getTime();
      if (!TypingDNA.isTarget(e.target.id)) {
        return;
      }
      var keyCode = e.keyCode;
      var targetIndex = TypingDNA.ACInputLengths.inputs.indexOf(e.target);
      if(targetIndex === -1) {
          TypingDNA.ACInputLengths.inputs.push(e.target);
          TypingDNA.ACInputLengths.lastLength.push(0);
          targetIndex = TypingDNA.ACInputLengths.inputs.indexOf(e.target);
      }
      if (keyCode == 229 && e.target.value.length >= TypingDNA.ACInputLengths.lastLength[targetIndex]) {
          var char = e.target.value.substr((e.target.selectionStart - 1) || 0 , 1);
          keyCode = char.toUpperCase().charCodeAt(0);
          TypingDNA.ACLastCharCode = char.charCodeAt(0);
          TypingDNA.ACLastKeyCode = char.toUpperCase().charCodeAt(0);
      }
      TypingDNA.ACInputLengths.lastLength[targetIndex] = e.target.value.length;
      var arr = [keyCode, TypingDNA.ACSeekTime, TypingDNA.ACPressTime, TypingDNA.ACPreviousKeyCode, TypingDNA.ACLastTime];
      TypingDNA.history.add(arr);
      TypingDNA.ACPreviousKeyCode = keyCode;
      if (TypingDNA.diagramRecording == true ) {
        var arrD = [keyCode, TypingDNA.ACSeekTime, TypingDNA.ACPressTime, TypingDNA.ACLastCharCode];
        TypingDNA.history.addDiagram(arrD);
      }
    }

    TypingDNA.isTarget = function(target) {
      if (TypingDNA.lastTarget == target && TypingDNA.lastTargetFound) {
        return true;
      } else {
        var targetLength = TypingDNA.targetIds.length;
        var targetFound = false;
        if (targetLength > 0) {
          for (var i = 0; i < targetLength; i++) {
            if (TypingDNA.targetIds[i] == target) {
              targetFound = true;
              break;
            }
          }
          TypingDNA.lastTarget = target;
          TypingDNA.lastTargetFound = targetFound;
          return targetFound;
        } else {
          TypingDNA.lastTarget = target;
          TypingDNA.lastTargetFound = true;
          return true;
        }
      }
    }

    if (TypingDNA.document.addEventListener) {
      TypingDNA.document.addEventListener("keydown", TypingDNA.keyDown);
      TypingDNA.document.addEventListener("keyup", TypingDNA.keyUp);
      TypingDNA.document.addEventListener("keypress", TypingDNA.keyPress);
      TypingDNA.document.addEventListener("mousemove", TypingDNA.mouseMove);
      TypingDNA.document.addEventListener("mousedown", TypingDNA.mouseDown);
      TypingDNA.document.addEventListener("mouseup", TypingDNA.mouseUp);
      TypingDNA.document.addEventListener("scroll", TypingDNA.mouseScroll);
    } else if (TypingDNA.document.attachEvent) {
      TypingDNA.document.attachEvent("onkeydown", TypingDNA.keyDown);
      TypingDNA.document.attachEvent("onkeyup", TypingDNA.keyUp);
      TypingDNA.document.attachEvent("onkeypress", TypingDNA.keyPress);
      TypingDNA.document.attachEvent("onmousemove", TypingDNA.mouseMove);
      TypingDNA.document.attachEvent("onmousedown", TypingDNA.mouseDown);
      TypingDNA.document.attachEvent("onmouseup", TypingDNA.mouseUp);
      TypingDNA.document.attachEvent("onscroll", TypingDNA.mouseScroll);
    } else {
      console.log("browser not supported");
    }

    TypingDNA.mouse = {};
    TypingDNA.mouse.times = [];
    TypingDNA.mouse.xPositions = [];
    TypingDNA.mouse.yPositions = [];
    TypingDNA.mouse.scrollTimes = [];
    TypingDNA.mouse.scrollTopArr = [];
    TypingDNA.mouse.history = {};
    TypingDNA.mouse.history.stack = [];

    TypingDNA.mouse.getDistance = function(a, b) {
      return Math.sqrt((a * a) + (b * b));
    }

    TypingDNA.mouse.getTotalDistance = function(xPositions, yPositions) {
      var totalDistance = 0;
      var length = xPositions.length;
      for (i = 1; i < length - 1; i++) {
        var a = xPositions[i] - xPositions[i - 1];
        var b = yPositions[i] - yPositions[i - 1];
        totalDistance += TypingDNA.mouse.getDistance(a, b);
      }
      return totalDistance;
    }

    TypingDNA.mouse.getAngle = function(xPosDelta, yPosDelta) {
      var angle = 0;
      var leftRight = (xPosDelta >= 0); // 1 if left, 0 if right
      var downUp = (yPosDelta < 0); // 1 if down, 0 if up
      if (leftRight) {
        if (downUp) {
          angle = 180 + (Math.round(Math.atan(Math.abs(xPosDelta) / (Math.abs(yPosDelta) + 0.0000001)) / 0.01745329251)) // 0.01745329251 = pi/180
        } else {
          angle = 270 + (90 - Math.round(Math.atan(Math.abs(xPosDelta) / (Math.abs(yPosDelta) + 0.0000001)) / 0.01745329251))
        }
      } else {
        if (downUp) {
          angle = 90 + (90 - Math.round(Math.atan(Math.abs(xPosDelta) / (Math.abs(yPosDelta) + 0.0000001)) / 0.01745329251))
        } else {
          angle = Math.round(Math.atan(Math.abs(xPosDelta) / (Math.abs(yPosDelta) + 0.0000001)) / 0.01745329251)
        }
      }
      return angle;
    }

    TypingDNA.mouse.recordMoveAction = function() {
      var length = TypingDNA.mouse.times.length;
      if (length < 3) {
        return;
      }
      var deltaTime = TypingDNA.mouse.times[length - 1] - TypingDNA.mouse.times[0];
      var xPosDelta = TypingDNA.mouse.xPositions[length - 1] - TypingDNA.mouse.xPositions[0];
      var yPosDelta = TypingDNA.mouse.yPositions[length - 1] - TypingDNA.mouse.yPositions[0];
      var directDistance = Math.round(TypingDNA.mouse.getDistance(xPosDelta, yPosDelta));
      var totalDistance = Math.round(TypingDNA.mouse.getTotalDistance(TypingDNA.mouse.xPositions, TypingDNA.mouse.yPositions));
      var ratioDistance = Math.round(totalDistance * 100 / directDistance);
      var speed = Math.round(directDistance * 100 / deltaTime);
      var angle = TypingDNA.mouse.getAngle(xPosDelta, yPosDelta);
      var eventType = 1;
      var arr = [eventType, deltaTime, directDistance, speed, angle, ratioDistance];
      for (i in arr) {
        if (isNaN(arr[i])) {
          return;
        }
      }
      TypingDNA.mouse.history.add(arr);
      TypingDNA.lastMouseStop = false;
    }

    TypingDNA.mouse.recordScrollAction = function() {
      var length = TypingDNA.mouse.scrollTimes.length;
      if (length < 2) {
        return;
      }
      var deltaTime = TypingDNA.mouse.scrollTimes[length - 1] - TypingDNA.mouse.scrollTimes[0];
      var directDistance = TypingDNA.mouse.scrollTopArr[length - 1] - TypingDNA.mouse.scrollTopArr[0];
      var speed = Math.round(directDistance * 100 / deltaTime);
      var eventType = 2;
      var arr = [eventType, deltaTime, directDistance, speed];
      for (i in arr) {
        if (isNaN(arr[i]) && !isFinite(arr[i])) {
          return;
        }
      }
      TypingDNA.mouse.history.add(arr);
    }

    TypingDNA.mouse.history.add = function(arr) {
      this.stack.push(arr);
      if (this.stack.length > TypingDNA.maxMouseHistoryLength) {
        this.stack.shift();
      }
    }

    TypingDNA.mouse.history.getDiagram = function() {
      var mouseDiagram = this.stack.join("|");
      return [String(TypingDNA.isMobile()) + "," + String(TypingDNA.version), mouseDiagram].join("|");
    }

    TypingDNA.mouse.clearLastMove = function() {
      TypingDNA.mouse.times = [];
      TypingDNA.mouse.xPositions = [];
      TypingDNA.mouse.yPositions = [];
    }

    TypingDNA.mouse.checkMove = function() {
      clearInterval(TypingDNA.moveInterval);
      if (TypingDNA.mouse.started == true) {
        TypingDNA.mouse.started = false;
        TypingDNA.mouse.recordMoveAction();
        TypingDNA.mouse.clearLastMove();
      }
    }

    TypingDNA.mouse.clearLastScroll = function() {
      TypingDNA.mouse.scrollTimes = [];
      TypingDNA.mouse.scrollTopArr = [];
    }

    TypingDNA.mouse.checkScroll = function() {
      clearInterval(TypingDNA.scrollInterval);
      if (TypingDNA.mouse.scrollStarted == true) {
        TypingDNA.mouse.scrollStarted = false;
        TypingDNA.mouse.recordScrollAction();
        TypingDNA.mouse.clearLastScroll();
      }
    }

    /**
     * Adds a target to the targetIds array.
     */
    TypingDNA.addTarget = function(target) {
      var targetLength = TypingDNA.targetIds.length;
      var targetFound = false;
      if (targetLength > 0) {
        for (var i = 0; i < targetLength; i++) {
          if (TypingDNA.targetIds[i] == target) {
            targetFound = true;
            break;
          }
        }
        if (!targetFound) {
          TypingDNA.targetIds.push(target);
        }
      } else {
        TypingDNA.targetIds.push(target);
      }
    }

    /**
     * Adds a target to the targetIds array.
     */
    TypingDNA.removeTarget = function(target) {
      var targetLength = TypingDNA.targetIds.length;
      if (targetLength > 0) {
        for (var i = 0; i < targetLength; i++) {
          if (TypingDNA.targetIds[i] == target) {
            TypingDNA.targetIds.splice(i, 1);
            break;
          }
        }
      }
    }

    /**
     * Resets the history stack
     */
    TypingDNA.reset = function(all) {
      TypingDNA.history.stack = [];
      TypingDNA.history.stackDiagram = [];
      TypingDNA.clickTimes = [];
      TypingDNA.stopTimes = [];
      TypingDNA.ACInputLengths = {
          inputs: [],
          lastLength: [],
      };
      if (all == true) {
        TypingDNA.mouse.history.stack = [];
      }
    }

    /**
     * Automatically called at initilization. It starts the recording of keystrokes.
     */
    TypingDNA.start = function() {
      TypingDNA.diagramRecording = true;
      return TypingDNA.recording = true;
    }

    /**
     * Ends the recording of further keystrokes. To restart recording afterwards you can
     * either call TypingDNA.start() or create a new TypingDNA object again, not recommended.
     */
    TypingDNA.stop = function() {
      TypingDNA.diagramRecording = false;
      return TypingDNA.recording = false;
    }

    /**
     * Starts the recording of mouse activity.
     */
    TypingDNA.startMouse = function() {
      return TypingDNA.mouseRecording = TypingDNA.mouseMoveRecording = true;
    }

    /**
     * Stops the recording of mouse activity.
     */
    TypingDNA.stopMouse = function() {
      return TypingDNA.mouseRecording = TypingDNA.mouseMoveRecording = false;
    }

    /**
     * This is the main function that outputs the typing pattern as a String
     * {type:Number, text:String, textId:Number, length: Number, targetId:String, caseSensitive:Boolean}
     * @param {Object} obj an object with the following properties
     * * * @param {String} type 0 for anytext pattern, 1 for sametext pattern (also called diagram pattern)
     * * * and 2 for extended pattern (most versatile, can replace both anytext and sametext patterns)
     * * * @param {Number} length (Optional) the length of the text in the history for which you want
     * * * the typing pattern. length is ignored when text or targetId is set (or both).
     * * * @param {String} text  (Only for type 1 and type 2) a typed string that you want the typing pattern for
     * * * @param {Number} textId (Optional, only for type 1 and type 2) a personalized id for the typed text
     * * * @param {String} targetId (Optional) specifies if pattern is obtain only from text typed in a certain target
     * * * @param {Boolean} caseSensitive (Optional, default: false) Used if you pass a text for type 1 or type 2
     * * * DEPRECATED * * * in favor of type = 2 * * *
     * * * @param {Boolean} extended (Only for type 1) specifies if full information about what was typed is produced,
     * * * including the actual key pressed, if false, only the order of pressed keys is kept (no actual content)
     * @return {String} A typing pattern in string form
     * @example var typingPattern = tdna.getTypingPattern({type=0, length=180});
     * @example var typingPattern = tdna.getTypingPattern({type=1, text="Hello5g21?*"});
     * @example var typingPattern = tdna.getTypingPattern({type=2, text="example@mail.com"});
     */
    TypingDNA.getTypingPattern = function(obj) {
      if (typeof obj === 'object') {
        switch (obj.type) {
          case 0:
            return TypingDNA.get(obj.length, obj.targetId);
            break;
          case 1:
            var str = (obj.text != undefined) ? obj.text : obj.length;
            return TypingDNA.history.getDiagram(obj.extended, str, obj.textId, obj.targetId, obj.caseSensitive);
            break;
          case 2:
            var str = (obj.text != undefined) ? obj.text : obj.length;
            return TypingDNA.history.getDiagram(true, str, obj.textId, obj.targetId, obj.caseSensitive);
            break;
          default:
            return TypingDNA.get(obj.length);
            break;
        }
      } else {
        return TypingDNA.get();
      }
    }

    TypingDNA.getDiagram = function(str, textId) {
      return TypingDNA.history.getDiagram(false, str, textId, undefined, false);
    }

    TypingDNA.getExtendedDiagram = function(str, textId) {
      return TypingDNA.history.getDiagram(true, str, textId, undefined, false);
    }

    TypingDNA.getMouseDiagram = function() {
      return TypingDNA.mouse.history.getDiagram();
    }

    TypingDNA.get = function(length, targetId) {
      var historyTotalLength = TypingDNA.history.stack.length;
      if (length == undefined || length == 0) {
        length = TypingDNA.defaultHistoryLength;
      }
      if (length > historyTotalLength) {
        length = historyTotalLength;
      }
      var obj = {};
      [obj.arr, targetLength] = TypingDNA.history.get(length, "", targetId);
      if (targetId != undefined && targetId != "") {
        length = targetLength;
      }
      var zl = TypingDNA.zl;
      var histRev = length;
      var histSktF = TypingDNA.math.fo(TypingDNA.history.get(length, "seek", targetId));
      var histPrtF = TypingDNA.math.fo(TypingDNA.history.get(length, "press", targetId));
      var pressHistMean = Math.round(TypingDNA.math.avg(histPrtF));
      var seekHistMean = Math.round(TypingDNA.math.avg(histSktF));
      var pressHistSD = Math.round(TypingDNA.math.sd(histPrtF));
      var seekHistSD = Math.round(TypingDNA.math.sd(histSktF));
      var charMeanTime = seekHistMean + pressHistMean;
      var pressRatio = TypingDNA.math.rd((pressHistMean + zl) / (charMeanTime + zl), 4);
      var seekToPressRatio = TypingDNA.math.rd((1 - pressRatio) / pressRatio, 4);
      var pressSDToPressRatio = TypingDNA.math.rd((pressHistSD + zl) / (pressHistMean + zl), 4);
      var seekSDToPressRatio = TypingDNA.math.rd((seekHistSD + zl) / (pressHistMean + zl), 4);
      var cpm = Math.round(6E4 / (charMeanTime + zl));
      if (histRev == 0) {
        cpm = 0;
      }
      for (var i in obj.arr) {
        var rev = obj.arr[i][1].length;
        var seekMean = 0;
        var pressMean = 0;
        var postMean = 0;
        var seekSD = 0;
        var pressSD = 0;
        var postSD = 0;
        switch (obj.arr[i][0].length) {
          case 0:
            break;
          case 1:
            var seekMean = TypingDNA.math.rd((obj.arr[i][0][0] + zl) / (seekHistMean + zl), 4);
            break;
          default:
            var arr = TypingDNA.math.fo(obj.arr[i][0]);
            seekMean = TypingDNA.math.rd((TypingDNA.math.avg(arr) + zl) / (seekHistMean + zl), 4);
            seekSD = TypingDNA.math.rd((TypingDNA.math.sd(arr) + zl) / (seekHistSD + zl), 4);
        }
        switch (obj.arr[i][1].length) {
          case 0:
            break;
          case 1:
            var pressMean = TypingDNA.math.rd((obj.arr[i][1][0] + zl) / (pressHistMean + zl), 4);
            break;
          default:
            var arr = TypingDNA.math.fo(obj.arr[i][1]);
            pressMean = TypingDNA.math.rd((TypingDNA.math.avg(arr) + zl) / (pressHistMean + zl), 4);
            pressSD = TypingDNA.math.rd((TypingDNA.math.sd(arr) + zl) / (pressHistSD + zl), 4);
        }
        switch (obj.arr[i][2].length) {
          case 0:
            break;
          case 1:
            var postMean = TypingDNA.math.rd((obj.arr[i][2][0] + zl) / (seekHistMean + zl), 4);
            break;
          default:
            var arr = TypingDNA.math.fo(obj.arr[i][2]);
            postMean = TypingDNA.math.rd((TypingDNA.math.avg(arr) + zl) / (seekHistMean + zl), 4);
            postSD = TypingDNA.math.rd((TypingDNA.math.sd(arr) + zl) / (seekHistSD + zl), 4);
        }
        delete obj.arr[i][2];
        delete obj.arr[i][1];
        delete obj.arr[i][0];
        obj.arr[i][0] = rev;
        obj.arr[i][1] = seekMean;
        obj.arr[i][2] = pressMean;
        obj.arr[i][3] = postMean;
        obj.arr[i][4] = seekSD;
        obj.arr[i][5] = pressSD;
        obj.arr[i][6] = postSD;
      }
      var arr = [];
      TypingDNA.apu(arr, histRev);
      TypingDNA.apu(arr, cpm);
      TypingDNA.apu(arr, charMeanTime);
      TypingDNA.apu(arr, pressRatio);
      TypingDNA.apu(arr, seekToPressRatio);
      TypingDNA.apu(arr, pressSDToPressRatio);
      TypingDNA.apu(arr, seekSDToPressRatio);
      TypingDNA.apu(arr, pressHistMean);
      TypingDNA.apu(arr, seekHistMean);
      TypingDNA.apu(arr, pressHistSD);
      TypingDNA.apu(arr, seekHistSD);
      for (var c = 0; c <= 6; c++) {
        for (var i = 0; i < 44; i++) {
          var keyCode = TypingDNA.keyCodes[i];
          var val = obj.arr[keyCode][c];
          if (val == 0 && c > 0) {
            val = 1;
          }
          TypingDNA.apu(arr, val);
        }
      }
      TypingDNA.apu(arr, TypingDNA.isMobile());
      TypingDNA.apu(arr, TypingDNA.version);
      TypingDNA.apu(arr, TypingDNA.flags);
      arr.push(TypingDNA.history.getSpecialKeys());
      return arr.join(",");
    }

    TypingDNA.apu = function(arr, val) {
      "NaN" == String(val) && (val = 0);
      arr.push(val);
    }

    TypingDNA.math = {};

    TypingDNA.math.rd = function(val, dec) {
      return Number(val.toFixed(dec));
    }

    TypingDNA.math.avg = function(arr) {
      var len = arr.length;
      if (len > 0) {
        var sum = 0;
        for (var i = 0; i < len; i++) {
          sum += arr[i];
        }
        return this.rd(sum / len, 4);
      } else {
        return 0;
      }
    }

    TypingDNA.math.sd = function(arr) {
      var len = arr.length;
      if (len < 2) {
        return 0;
      } else {
        var sumVS = 0;
        var mean = this.avg(arr);
        for (var i = 0; i < len; i++) {
          sumVS += (arr[i] - mean) * (arr[i] - mean);
        }
        var sd = Math.sqrt(sumVS / len);
        return sd;
      }
    }

    TypingDNA.math.fo = function(arr) {
      if (arr.length > 1) {
        var values = arr.concat();
        var len = arr.length;
        values.sort(function(a, b) {
          return a - b;
        });
        var asd = this.sd(values);
        var aMean = values[Math.ceil(arr.length / 2)];
        var multiplier = 2;
        var maxVal = aMean + multiplier * asd;
        var minVal = aMean - multiplier * asd;
        if (len < 20) {
          minVal = 0;
        }
        var fVal = [];
        for (var i = 0; i < len; i++) {
          var tempval = values[i];
          if (tempval < maxVal && tempval > minVal) {
            fVal.push(tempval);
          }
        }
        return fVal;
      } else {
        return arr;
      }
    }

    // Calculate a 32 bit FNV-1a hash
    TypingDNA.math.fnv1aHash = function(str) {
      if (str == undefined && typeof str !== 'string') {
        return 0;
      }
      str = str.toLowerCase();
      var i, l;
      var hval = 0x721b5ad4;
      for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
      }
      return hval >>> 0;
    }

    TypingDNA.history = {};
    TypingDNA.history.stack = [];
    TypingDNA.history.stackDiagram = [];

    TypingDNA.history.add = function(arr) {
      this.stack.push(arr);
      if (this.stack.length > TypingDNA.maxHistoryLength) {
        this.stack.shift();
      }
    }

    TypingDNA.history.addDiagram = function(arr) {
      this.stackDiagram.push(arr);
    }

    TypingDNA.history.getDiagram = function(extended, str, textId, targetId, caseSensitive) {
      var caseSensitive = (caseSensitive != undefined) ? caseSensitive : (str == undefined || str == "");
      var returnArr = [];
      var diagramType = (extended == true) ? 1 : 0;
      var stackDiagram = this.stackDiagram;
      if (targetId != undefined && targetId != "" && stackDiagram.length > 0) {
        stackDiagram = TypingDNA.sliceStackByTargetId(stackDiagram, targetId);
        if (str == undefined || str == "") {
          var element = TypingDNA.document.getElementById(targetId);
          if (element != null) {
            str = element.value;
          }
        }
      } else {
        var targetLength = TypingDNA.targetIds.length;
        if (str == undefined || str == "") {
          if (targetLength > 0) {
            str = "";
            for (var i = 0; i < targetLength; i++) {
              var element = TypingDNA.document.getElementById(TypingDNA.targetIds[i]);
              if (element != null) {
                str += element.value;
              }
            }
          } else {
            if (!extended) {
              console.log("Please use extended pattern OR provide a fixed string param OR use the addTarget method.");
            }
          }
        }
      }
      var missingCount = 0;
      var diagramHistoryLength = stackDiagram.length;
      var strLength = diagramHistoryLength;
      if (typeof str === 'string') {
        strLength = str.length;
      } else if (typeof str === 'number' && str < diagramHistoryLength) {
        strLength = str;
      }
      var returnTextId = 0;
      if (textId != undefined) {
        if (isNaN(parseInt(textId))) {
          returnTextId = TypingDNA.math.fnv1aHash(textId);
        } else {
          returnTextId = parseInt(textId);
        }
      } else {
        if (typeof str === 'string') {
          returnTextId = TypingDNA.math.fnv1aHash(str);
        }
      }
      returnArr.push([TypingDNA.isMobile(), TypingDNA.version, TypingDNA.flags, diagramType, strLength, returnTextId, TypingDNA.history.getSpecialKeys()]);
      if (str != undefined && str.length > 0 && typeof str === 'string') {
        var strLower = str.toLowerCase();
        var strUpper = str.toUpperCase();
        var lastFoundPos = [];
        var lastPos = 0;
        var strUpperCharCode;
        var currentSensitiveCharCode;
        for (var i = 0; i < str.length; i++) {
          var currentCharCode = str.charCodeAt(i);
          if (!caseSensitive) {
            strUpperCharCode = strUpper.charCodeAt(i);
            currentSensitiveCharCode = (strUpperCharCode != currentCharCode) ? strUpperCharCode : strLower.charCodeAt(i);
          }
          var startPos = lastPos;
          var finishPos = diagramHistoryLength;
          var found = false;
          while (found == false) {
            for (var j = startPos; j < finishPos; j++) {
              var arr = stackDiagram[j];
              var charCode = arr[3];
              if (charCode == currentCharCode || (!caseSensitive && charCode == currentSensitiveCharCode)) {
                found = true;
                if (j == lastPos) {
                  lastPos++;
                  lastFoundPos = [];
                } else {
                  lastFoundPos.push(j);
                  var len = lastFoundPos.length;
                  if (len > 1 && lastFoundPos[len - 1] == lastFoundPos[len - 2] + 1) {
                    lastPos = j + 1;
                    lastFoundPos = [];
                  }
                }
                var keyCode = arr[0];
                var seekTime = arr[1];
                var pressTime = arr[2];
                if (extended) {
                  returnArr.push([charCode, seekTime, pressTime, keyCode]);
                } else {
                  returnArr.push([seekTime, pressTime]);
                }
                break;
              }
            }
            if (found == false) {
              if (startPos != 0) {
                startPos = 0;
                finishPos = lastPos;
              } else {
                found = true;
                if (TypingDNA.replaceMissingKeys) {
                  missingCount++;
                  if (typeof TypingDNA.savedMissingAvgValues !== 'object' || TypingDNA.savedMissingAvgValues.historyLength != diagramHistoryLength) {
                    var histSktF = TypingDNA.math.fo(TypingDNA.history.get(0, "seek"));
                    var histPrtF = TypingDNA.math.fo(TypingDNA.history.get(0, "press"));
                    var seekTime = Math.round(TypingDNA.math.avg(histSktF));
                    var pressTime = Math.round(TypingDNA.math.avg(histPrtF));
                    TypingDNA.savedMissingAvgValues = {
                      seekTime: seekTime,
                      pressTime: pressTime,
                      historyLength: diagramHistoryLength
                    };
                  } else {
                    var seekTime = TypingDNA.savedMissingAvgValues.seekTime;
                    var pressTime = TypingDNA.savedMissingAvgValues.pressTime;
                  }
                  var missing = 1;
                  if (extended) {
                    returnArr.push([currentCharCode, seekTime, pressTime, currentCharCode, missing]);
                  } else {
                    returnArr.push([seekTime, pressTime, missing]);
                  }
                  break;
                }
              }
            }
          }
          if (TypingDNA.replaceMissingKeysPerc < missingCount * 100 / strLength) {
            return null;
          }
        }
      } else {
        var startCount = 0;
        if (typeof str === 'number') {
          startCount = diagramHistoryLength - str;
        }
        if (startCount < 0) {
          startCount = 0;
        }
        for (var i = startCount; i < diagramHistoryLength; i++) {
          var arr = stackDiagram[i];
          var keyCode = arr[0];
          var seekTime = arr[1];
          var pressTime = arr[2];
          if (extended) {
            var charCode = arr[3];
            returnArr.push([charCode, seekTime, pressTime, keyCode]);
          } else {
            returnArr.push([seekTime, pressTime]);
          }
        }
      }
      return returnArr.join("|");
    }

    TypingDNA.sliceStackByTargetId = function(stack, targetId) {
      var length = stack.length;
      var newStack = [];
      for (i = 0; i < length; i++) {
        var arr = stack[i];
        if (arr[5] == targetId) {
          newStack.push(arr);
        }
      }
      return newStack;
    }

    TypingDNA.history.get = function(length, type, targetId) {
      var stack = this.stack;
      if (targetId != undefined && targetId != "" && stack.length > 0) {
        stack = TypingDNA.sliceStackByTargetId(stack, targetId);
      }
      var historyTotalLength = stack.length;
      if (length == 0 || length == undefined) {
        length = TypingDNA.defaultHistoryLength;
      }
      if (length > historyTotalLength) {
        length = historyTotalLength;
      }
      switch (type) {
        case "seek":
          var seekArr = [];
          for (i = 1; i <= length; i++) {
            var seekTime = stack[historyTotalLength - i][1];
            if (seekTime <= TypingDNA.maxSeekTime) {
              seekArr.push(seekTime);
            }
          };
          return seekArr;
          break;
        case "press":
          var pressArr = [];
          for (i = 1; i <= length; i++) {
            var pressTime = stack[historyTotalLength - i][2];
            if (pressTime <= TypingDNA.maxPressTime) {
              pressArr.push(pressTime);
            }
          };
          return pressArr;
          break;
        default:
          var historyStackObj = {};
          for (var i in TypingDNA.keyCodes) {
            historyStackObj[TypingDNA.keyCodes[i]] = [
              [],
              [],
              []
            ];
          }
          for (i = 1; i <= length; i++) {
            var arr = stack[historyTotalLength - i];
            var keyCode = arr[0];
            var seekTime = arr[1];
            var pressTime = arr[2];
            var prevKeyCode = arr[3];
            if (TypingDNA.keyCodesObj[keyCode]) {
              if (seekTime <= TypingDNA.maxSeekTime) {
                historyStackObj[keyCode][0].push(seekTime);
                if (prevKeyCode != 0 && TypingDNA.keyCodesObj[prevKeyCode]) {
                  historyStackObj[prevKeyCode][2].push(seekTime);
                }
              }
              if (pressTime <= TypingDNA.maxPressTime) {
                historyStackObj[keyCode][1].push(pressTime);
              }
            }
          };
          return [historyStackObj, length];
      }
    }

    TypingDNA.history.getSpecialKeys = function() {
      var returnArr = [];
      var length = this.stack.length;
      var historyStackObj = {};
      for (var i in TypingDNA.spKeyCodes) {
        historyStackObj[TypingDNA.spKeyCodes[i]] = [
          [],
        ];
      }
      for (i = 1; i <= length; i++) {
        var arr = this.stack[length - i];
        if (TypingDNA.spKeyCodesObj[arr[0]]) {
          var keyCode = arr[0];
          var pressTime = arr[2];
          if (pressTime <= TypingDNA.maxPressTime) {
            historyStackObj[keyCode][0].push(pressTime);
          }
        }
      }
      for (var i in TypingDNA.spKeyCodes) {
        var arr = TypingDNA.math.fo(historyStackObj[TypingDNA.spKeyCodes[i]][0]);
        var arrLen = arr.length;
        returnArr.push(arrLen);
        if (arrLen > 1) {
          returnArr.push(Math.round(TypingDNA.math.avg(arr)));
          returnArr.push(Math.round(TypingDNA.math.sd(arr)));
        } else if (arrLen == 1) {
          returnArr.push([arr[0], -1]);
        } else {
          returnArr.push([-1, -1]);
        }
      }
      var clicksArrLen = TypingDNA.clickTimes.length;
      returnArr.push(clicksArrLen);
      if (clicksArrLen > 1) {
        returnArr.push(Math.round(TypingDNA.math.avg(TypingDNA.clickTimes)));
        returnArr.push(Math.round(TypingDNA.math.sd(TypingDNA.clickTimes)));
      } else if (clicksArrLen == 1) {
        returnArr.push(TypingDNA.clickTimes[0], -1);
      } else {
        returnArr.push([-1, -1]);
      }
      var stopArrLen = TypingDNA.stopTimes.length;
      returnArr.push(stopArrLen);
      if (stopArrLen > 1) {
        returnArr.push(Math.round(TypingDNA.math.avg(TypingDNA.stopTimes)));
        returnArr.push(Math.round(TypingDNA.math.sd(TypingDNA.stopTimes)));
      } else if (stopArrLen == 1) {
        returnArr.push(TypingDNA.stopTimes[0], -1);
      } else {
        returnArr.push([-1, -1]);
      }
      return returnArr;
    }

    /**
     * Checks the quality of a typing pattern, how well it is revelated, how useful the
     * information will be for matching applications. It returns a value between 0 and 1.
     * Values over 0.3 are acceptable, however a value over 0.7 shows good pattern strength.
     * @param  {String} typingPattern The typing pattern string returned by the get() function.
     * @return {Number} A real number between 0 and 1. A close to 1 value means a stronger pattern.
     * @example var quality = tdna.getQuality(typingPattern);
     */
    TypingDNA.getQuality = function(typingPattern) {
      var obj = typingPattern.split(",");
      for (i = 0; i < obj.length; i++) {
        obj[i] = Number(obj[i]);
      }
      var totalEvents = obj[0];
      var acc = rec = avgAcc = 0;
      var avg = TypingDNA.math.avg(obj);
      var revs = obj.slice(11, 55);
      for (var i in revs) {
        rec += Number(revs[i] > 0);
        acc += Number(revs[i] > 4);
        avgAcc += Number(revs[i] > avg);
      }
      var tReturn = Math.sqrt(rec * acc * avgAcc) / 80;
      return tReturn > 1 ? 1 : tReturn;
    }

    /**
     * Checks the validity of a typing pattern if recorded on mobile.
     * @param  {String} typingPattern The typing pattern string returned by the get() function.
     * @return {Number} A real number between 0 and 1. A number larger than 0.7 usually means a valid pattern.
     * @example var quality = tdna.checkMobileValidity(typingPattern);
     */
    TypingDNA.checkMobileValidity = function(typingPattern) {
      var obj = typingPattern.split(",");
      var totalEvents = obj[0];
      if (totalEvents == 0) {
        return 0;
      }
      var rec = 0;
      var revs = obj.slice(11, 55);
      for (var i in revs) {
        rec += Number(revs[i]);
      }
      return rec / totalEvents;
    }

    TypingDNA.getLength = function(typingPattern) {
      return Number(typingPattern.split(",")[1]);
    }

    TypingDNA.isMobile = function() {
      if (TypingDNA.mobile != undefined) {
        return TypingDNA.mobile;
      } else {
        var check = 0;
        (function(a) {
          if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i
            .test(a) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
            .test(a.substr(0, 4))) {
            check = 1
          }
        })(navigator.userAgent || navigator.vendor || window.opera);
        TypingDNA.mobile = check;
        return check;
      }
    }

    TypingDNA.getTextId = function(str) {
      return TypingDNA.math.fnv1aHash(str);
    }
  } else {
    // TypingDNA is a static class, currently doesn't support actual multiple instances (Singleton implementation)
    return TypingDNA.instance;
  }
}
