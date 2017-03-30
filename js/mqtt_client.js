// Copyright (c) 2017, Kyushu University
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
// 3. Neither the name of the Institute nor the names of its contributors
//    may be used to endorse or promote products derived from this software
//    without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS ``AS IS'' AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED.  IN NO EVENT SHALL THE INSTITUTE OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
// OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
// OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
$(function(){
    const mqtt_host = {"hostname": "test.mosquitto.org",
                       "port": 8080};
    const topic_base = "/test" + (Math.floor(Math.random() * 100000));

    var is_connected = false;

    function onConnect() {
        console.log("onConnect");
        client.subscribe(topic_base + "/create/control");
        $("#connection_status").html("Conneced");
        $("#connection_status").removeClass("signal_error");
        $("#connection_status").addClass("signal_good");
        $("#reconnect_button").addClass("hide");
        is_connected = true;
    }

    function onConLost(responseObj) {
        is_connected = false;
        if (responseObj.errorCode !== 0) {
            console.log("onConLost: " + responseObj.errorMessage);
        }
        $("#connection_status").html("Connection lost");
        $("#connection_status").removeClass("signal_good");
        $("#connection_status").addClass("signal_error");
        $("#reconnect_button").removeClass("hide");
    }

    function connect() {
        client.connect({onSuccess: onConnect,
                        onFailure: function(e) {
                            console.log("Connection error");
                            $("#connection_status").html("Connection error");
                            $("#connection_status").removeClass("signal_good");
                            $("#connection_status").addClass("signal_error");
                            $("#reconnect_button").removeClass("hide");
                        },
                        timeout: 3
                       });
    }

    function ctrl_send(msg) {
        if (is_connected) {
            mqtt_msg = new Paho.MQTT.Message(msg);
            mqtt_msg.destinationName = topic_base + "/create/control";
            client.send(mqtt_msg);
        }
        else {
            console.log("ctrl_send: not connected yet");
        }
    }

    // create client instance
    $("#connection_status").html("Connecting...");
    var clientId = "jsmqtt_" + (Math.floor(Math.random() * 100000));
    client = new Paho.MQTT.Client(mqtt_host.hostname, Number(mqtt_host.port), clientId);
    client.onConnectionLost = onConLost;
    client.onMessageArrived = function(msg) { // reception process
        console.log("onMsgRecv: " + msg.payloadString + " DestName=" + msg.destinationName);
        switch (msg.destinationName) {
        case topic_base + "/create/control":
            $("#message_container").html("Control: " + msg.payloadString);
            break;
        default:
            break;
        }
    };
    // and connect to server
    connect();

    // handle button clicks
    $("#ctrl_forward").click(function() {
        ctrl_send("forward");
    });
    $("#ctrl_left").click(function() {
        ctrl_send("left");
    });
    $("#ctrl_stop").click(function() {
        ctrl_send("stop");
    });
    $("#ctrl_right").click(function() {
        ctrl_send("right");
    });
    $("#ctrl_back").click(function() {
        ctrl_send("back");
    });
    $("#reconnect").click(connect);
});
