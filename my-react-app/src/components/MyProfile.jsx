import Header from "./Header";
import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function MyProfile() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    contactNumber: "",
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User ID not found in local storage.");
      return;
    }

    let url = `https://tradenet-1.onrender.com/my-profile/${userId}`;

    axios
      .get(url)
      .then((res) => {
        if (res.data.user) {
          setUser(res.data.user);
        }
      })
      .catch(() => {
        alert("Server Error");
      });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('https://www.transparenttextures.com/patterns/brick-wall-dark.png')",
        backgroundRepeat: "repeat",
        paddingTop: "20px",
      }}
    >
      <Header />
      <h3 className="text-center my-4 text-white">USER PROFILE</h3>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <table className="table table-striped table-bordered text-center shadow-lg bg-white">
              <thead className="thead-dark">
                <tr>
                  <th>USERNAME</th>
                  <th>EMAIL</th>
                  <th>CONTACT NUMBER</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.contactNumber || "Not Provided"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
