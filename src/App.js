import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import {
    HubConnectionBuilder,
    LogLevel,
    HttpTransportType,
} from "@microsoft/signalr";
import useSignalR from "./CustomHooks/useSignalR";

function App() {
    const [connection, setConnection] = useState(null);
    const [data, setData] = useState([]);
    const [title, setTitle] = useState("1");

    const { _connection, invoke, on } = useSignalR(
        "https://localhost:5001/hubs/dataHub",
        true
    );

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
        try {
            on("ReceiveData", (data) => {
                console.log(data);
            });
            on("ConnectedMessage", (data) => {
                console.log(data);
            });
            on("RecordDeleted", (data) => {
                console.log(data);
            });
        } catch (error) {
            console.log("Connection failed: ", error);
        }
    }, [on]);

    const handleEditClick = (user) => {
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

                // axios.delete(`https://localhost:5001/api/data/${user.id}`);

                // await connection.invoke("sendData", { id: 2, name: "khalid" });
                invoke("sendData", { id: 2, name: "khalid" });
            } catch (e) {
                console.log(e);
            }
        } else {
            alert("No connection to server yet.");
        }
    };

    return (
        <div className="App">
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
    );
}

export default App;
