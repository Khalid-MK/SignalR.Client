import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import useSignalR from "./CustomHooks/useSignalR";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

function App() {
    const [connection, setConnection] = useState(null);
    const [data, setData] = useState([]);
    const [title, setTitle] = useState("1");
    const [openConnected, setOpenConnected] = useState(false);
    const [openDisConnected, setOpenDisConnected] = useState(false);

    const {
        invokeEvent,
        onEvent,
        offEvent,
        _connection,
        stopConnection,
        startConnection,
    } = useSignalR("https://localhost:5001/hubs/dataHub", true);

    useEffect(() => {
        async function getUsers() {
            let users = await axios
                .get("https://jsonplaceholder.typicode.com/users")
                .then(({ data }) => {
                    return data;
                });

            setData(users);
        }

        getUsers();

        return () => {
            stopConnection();
        };
    }, []);

    // Record Deleted
    useEffect(() => {
        onEvent("RecordDeleted", (response) => {
            let newData = data.filter((u) => u.id != response);
            setData(newData);
        });
        return () => {
            offEvent("RecordDeleted", null);
        };
    }, [data, offEvent, onEvent]);

    // Data Received
    useEffect(() => {
        onEvent("ReceiveData", (response) => {
            console.log(response);
        });
        return () => {
            offEvent("ReceiveData", null);
        };
    }, [data, offEvent, onEvent]);

    // Server Connected
    useEffect(() => {
        onEvent("ConnectedMessage", (response) => {
            setOpenConnected(true);
        });
        return () => {
            offEvent("ConnectedMessage", null);
        };
    }, [data, offEvent, onEvent]);

    const handleEditClick = (user) => {
        stopConnection();
        setOpenDisConnected(true);
        setTitle(user.name);
    };

    // Call Server Function
    const handleDleteClick = async (user) => {
        if (true) {
            try {
                invokeEvent("deleteUser", user.id);
            } catch (e) {
                console.log(e);
            }
        } else {
            alert("No connection to server yet.");
        }
    };

    const handleStartConnection = () => {
        startConnection();
    };

    return (
        <div className="App">
            <div>
                <Snackbar
                    open={openConnected}
                    autoHideDuration={2000}
                    onClose={() => setOpenConnected(!openConnected)}
                >
                    <Alert
                        onClose={() => setOpenConnected(!openConnected)}
                        severity="success"
                    >
                        Server Connected Successfuly !!
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={openDisConnected}
                    autoHideDuration={2000}
                    onClose={() => setOpenDisConnected(!openDisConnected)}
                >
                    <Alert
                        onClose={() => setOpenDisConnected(!openDisConnected)}
                        severity="error"
                    >
                        Server Disconnected !!
                    </Alert>
                </Snackbar>
                <table>
                    <tr>
                        <th>{title}</th>
                        <th>UserName</th>
                        <th>Email</th>
                    </tr>
                    {data.map((user, index) => {
                        return (
                            <tr key={index}>
                                <td>{user.name}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-danger"
                                        onClick={(e) => handleDleteClick(user)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="btn btn-warning"
                                        onClick={(e) => handleEditClick(user)}
                                    >
                                        End
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={(e) => handleStartConnection()}
                                    >
                                        Start
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </table>
            </div>
        </div>
    );
}

export default App;
