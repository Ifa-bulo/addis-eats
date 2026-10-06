loginForm.addEventListener("submit", e =>  {
  e.preventDefault();
  if (username.value.trim() === "admin" && password.value === "admin123")  {
    sessionStorage.setItem("adminLoggedIn", "true");
    location.href = "admin-dashboard.html"
  } else loginError.textContent = "Incorrect username or password."
}
);