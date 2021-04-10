import { useEffect, useRef, useCallback } from "react";
import {
    HubConnectionBuilder,
    LogLevel,
    HttpTransportType,
    HubConnectionState,
} from "@microsoft/signalr";

function useSignalR(url, isDebug = false) {
    //? create the connection instance
    //? withAutomaticReconnect will automatically try to reconnect
    //? and generate a new socket connection if needed
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

    //* Note: to keep the connection open the serverTimeout should be
    //* larger than the KeepAlive value that is set on the server
    //* keepAliveIntervalInMilliseconds default is 15000 and we are using default
    //* serverTimeoutInMilliseconds default is 30000 and we are using 60000 set below
    _connection.serverTimeoutInMilliseconds = 60000;

    //? re-establish the connection if connection dropped
    _connection.onclose((error) => {
        console.assert(_connection.state === HubConnectionState.Disconnected);
        isDebug &&
            console.log(
                "Connection closed due to error. Try refreshing this page to restart the connection",
                error ?? ""
            );
    });

    _connection.onreconnecting((error) => {
        console.assert(_connection.state === HubConnectionState.Reconnecting);
        isDebug &&
            console.log(
                "Connection lost due to error. Reconnecting.",
                error ?? ""
            );
    });

    _connection.onreconnected((connectionId) => {
        console.assert(_connection.state === HubConnectionState.Connected);
        isDebug &&
            console.log(
                "Connection reestablished. Connected with connectionId",
                connectionId ?? ""
            );
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(async () => {
        if (_connection && _connection.state !== HubConnectionState.Connected) {
            //? Start Connection
            await _connection
                .start()
                .catch((e) => isDebug && console.log("Connection failed: ", e));
        }

        return async () => {
            await _connection.stop();
        };
    }, [_connection, isDebug]);

    //? This Callback use to invoke Method in backend
    const invokeEvent = useCallback(
        (method, data) => {
            if (_connection.state === HubConnectionState.Connected) {
                _connection
                    .invoke(method, data)
                    .catch(
                        (e) =>
                            isDebug && console.log("Cannot Invoke this Event")
                    );
            } else {
                isDebug &&
                    console.log(
                        "Cannot Invoke this Event !! Server is disconnected"
                    );
            }
        },
        [_connection, isDebug]
    );

    //? This Callback use to fire event to backend
    const onEvent = useCallback(
        (event, callBack) => {
            try {
                _connection.on(event, callBack);
            } catch (e) {
                isDebug && console.log(e);
            }
        },
        [_connection, isDebug]
    );

    //? This Callback use to remove fire event to backend
    const offEvent = useCallback(
        (event, callBack) => {
            try {
                _connection.off(event, callBack);
            } catch (e) {
                isDebug && console.log(e);
            }
        },
        [_connection, isDebug]
    );

    //? Stop the Server Connection
    const stopConnection = () => {
        if (_connection.state === HubConnectionState.Connected) {
            _connection.stop().catch((e) => isDebug && console.log(e));
        }
    };

    //? Start the Server Connection
    const startConnection = () => {
        if (_connection.state !== HubConnectionState.Connected) {
            try {
                _connection.start();
            } catch (e) {
                isDebug && console.log(e);
            }
        }
    };

    return {
        _connection,
        invokeEvent,
        onEvent,
        offEvent,
        stopConnection,
        startConnection,
    };
}

export default useSignalR;
