import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import apiClient from "../api/apiClient"; // Import the centralized apiClient
import "./usersComponent.css";

const UsersComponent = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await apiClient.get("/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await apiClient.delete(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditedName(user.name);
    setEditedEmail(user.email);
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    try {
      await apiClient.patch(
        `/users/${editingUser}`,
        {
          name: editedName,
          email: editedEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(
        users.map((user) =>
          user._id === editingUser
            ? { ...user, name: editedName, email: editedEmail }
            : user
        )
      );

      setEditingUser(null);
      setEditedName("");
      setEditedEmail("");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const openDeleteModal = (userId) => {
    setShowDeleteModal(true);
    setUserToDelete(userId);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      handleDelete(userToDelete);
      closeDeleteModal();
    }
  };

  return (
    <div className="users-container">
      <h2>Users List</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                {editingUser === user._id ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editingUser === user._id ? (
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingUser === user._id ? (
                  <button onClick={handleUpdate}>Save</button>
                ) : (
                  <>
                    <button onClick={() => handleEdit(user)}>
                      <FaEdit color="black" />
                    </button>
                    <button onClick={() => openDeleteModal(user._id)}>
                      <FaTrashAlt color="black" />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default UsersComponent;
