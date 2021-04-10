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

    const { invoke, on, off, _connection } = useSignalR(
        "https://localhost:5001/hubs/dataHub",
        true
    );

    const del = (id) => {
        let newData = data.filter((u) => u.id != id);
        setData(newData);
    };

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
    }, []);

    useEffect(() => {
        on("RecordDeleted", (response) => {
            let newData = data.filter((u) => u.id != response);
            setData(newData);
        });
        return () => {
            off("RecordDeleted", null);
        };
    }, [data, off, on]);

    // useEffect(() => {
    //     console.log("in");
    //     try {
    //         on("ReceiveData", (response) => {
    //             console.log(response);
    //         });
    //         on("ConnectedMessage", (response) => {
    //             console.log(response);
    //             setOpenConnected(true);
    //         });
    //         on("DisConnectedMessage", (response) => {
    //             console.log(response);
    //             setOpenConnected(true);

    //             //setOpenDisConnected(true);
    //         });
    //     } catch (error) {
    //         console.log("Connection failed: ", error);
    //     }
    // }, [data]);

    const handleEditClick = (user) => {
        _connection.stop();
        setOpenDisConnected(true);

        // try {
        //     invoke("sendData2", { id: 2, name: "khalid" });
        // } catch (e) {
        //     console.log(e);
        // }
        setTitle(user.name);
    };

    // Call Server Function
    const handleDleteClick = async (user) => {
        if (true) {
            try {
                // Invoke Server Method.

                // await axios.post(
                //     "https://localhost:5001/api/data/insertdata",
                //     JSON.stringify(user),
                //     {
                //         headers: {
                //             "Content-Type": "application/json",
                //         },
                //     }
                // );

                //axios.delete(`https://localhost:5001/api/data/${user.id}`);

                invoke("deleteUser", user.id);
                //invoke("sendData", { id: 2, name: "khalid" });
            } catch (e) {
                console.log(e);
            }
        } else {
            alert("No connection to server yet.");
        }
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
                                        Edit
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
