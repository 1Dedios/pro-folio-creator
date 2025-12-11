const signupForm = document.getElementById("signup-form");
const signupDescription = document.getElementById("signupDescription");
const signupUsername = document.getElementById("signupUsername");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");

const loginForm = document.getElementById("login-form");
const loginDescription = document.getElementById("loginDescription");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prevError = document.querySelector("p.form-client-error");
    if (prevError) prevError.remove();

    const validationResult = formValidation(
      signupUsername.value,
      signupEmail.value,
      signupPassword.value
    );
    if (!validationResult) return;

    // AFTER successful validation
    try {
      const response = await fetch("/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupUsername.value,
          email: signupEmail.value,
          password: signupPassword.value,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        const error = document.createElement("p");
        error.className = "form-client-error";
        error.textContent = `Error: ${result.error}`;
        signupDescription.appendChild(error);
        return;
      }

      // SUCCESS - redirect
      window.location = "/users/login";
    } catch (e) {
      const error = document.createElement("p");
      error.className = "form-client-error";
      error.textContent = `Server error: ${e.error}`;
      signupDescription.appendChild(error);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prevError = document.querySelector("p.form-client-error");
    if (prevError) prevError.remove();

    const validationResult = formValidation(
      loginUsername.value,
      loginPassword.value
    );
    if (!validationResult) return;

    // AFTER successful validation
    try {
      const response = await fetch("/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.value,
          password: loginPassword.value,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        const error = document.createElement("p");
        error.className = "form-client-error";
        error.textContent = `Error: ${result.error}`;
        loginDescription.appendChild(error);
        return;
      }

      // SUCCESS - redirect
      window.location = "/users/profile";
    } catch (e) {
      const error = document.createElement("p");
      error.className = "form-client-error";
      error.textContent = `Server error: ${e.message}`;
      loginDescription.appendChild(error);
    }
  });
}

function formValidation(...fields) {
  const prevError = document.querySelector("p.form-client-error");
  if (prevError) prevError.remove();

  // login form
  if (fields.length === 2) {
    let params = [...fields];
    params.forEach((el, i) => {
      params[i] = el.trim();
    });

    if (params.includes("") || params.includes(undefined)) {
      const error = document.createElement("p");
      error.className = "form-client-error";
      error.textContent = "one or more values in the form are empty";
      loginDescription.append(error);
      return false;
    }

    let userName = params[0];
    if (userName.split("").length < 3) {
      const error = document.createElement("p");
      error.className = "form-client-error";
      error.textContent = "username must be at least 3 characters long";
      loginUsername.appendChild(error);
      return false;
    }

    let desiredPassword = params[1];
    if (desiredPassword.split("").length < 8) {
      const error = document.createElement("p");
      error.className = "form-client-error";
      error.textContent = "password must be at least 8 characters long";
      loginPassword.appendChild(error);
      return false;
    }

    return true;
  }

  // signupform
  let params = [...fields];
  params.forEach((el, i) => {
    params[i] = el.trim();
  });

  if (params.includes("") || params.includes(undefined)) {
    const error = document.createElement("p");
    error.className = "form-client-error";
    error.textContent = "one or more values in the form are empty";
    signupDescription.appendChild(error);
    return false;
  }

  let userName = params[0];
  if (userName.split("").length < 3) {
    const error = document.createElement("p");
    error.className = "form-client-error";
    error.textContent = "username must be at least 3 characters long";
    signupUsername.appendChild(error);
    return false;
  }

  let userEmail = params[1];
  if (userEmail.split("").length > 254) {
    const error = document.createElement("p");
    error.className = "form-client-error";
    error.textContent = "email cannot exceed 254 characters";
    signupEmail.appendChild(error);
    return false;
  }

  let desiredPassword = params[2];
  if (desiredPassword.split("").length < 8) {
    const error = document.createElement("p");
    error.className = "form-client-error";
    error.textContent = "password must be at least 8 characters long";
    signupPassword.appendChild(error);
    return false;
  }

  return true;
}
