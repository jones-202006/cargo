const API_URL = "http://localhost:5000/api/auth/login";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.style.color = "red";
            message.textContent = data.message;
            return;
        }

        // Save token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        message.style.color = "green";
        message.textContent = "Login Successful";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (err) {
        message.style.color = "red";
        message.textContent = "Server not reachable";
        console.error(err);
    }

});

