import { useState, useEffect, useRef, useCallback } from "react";
import {
    HubConnectionBuilder,
    LogLevel,
    HttpTransportType,
} from "@microsoft/signalr";

function useSignalR(url, isDebug = false) {
    let _connection = useRef(
        new HubConnectionBuilder()
            .configureLogging(isDebug ? LogLevel.Debug : LogLevel.None)
            .withUrl(url, {
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .build()
    ).current;

    useEffect(() => {
        if (_connection) {
            // Start Connection
            _connection
                .start()
                // Define CallBack Function
                .then((result) => {
                    console.log("Connected!");
                })
                .catch((e) => console.log("Connection failed: ", e));
        }
    }, [_connection]);

    const invoke = useCallback(
        (method, data) => {
            _connection.invoke(method, data);
        },
        [_connection]
    );

    const on = useCallback(
        (event, callBack) => {
            _connection.on(event, callBack);
        },
        [_connection]
    );

    return { _connection, invoke, on };

    // return {
    //     isRunning: connectionOn,
    //     on: connection && connection.on,
    //     invoke: connection && connection.invoke,
    // };
}

export default useSignalR;
