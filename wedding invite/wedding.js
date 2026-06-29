document.addEventListener("DOMContentLoaded", () => {
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzENUSWwzCqd-jI5jTTnpmggLhrVN5GxCTe8g3bEI4XvJ3nxD7tt5j_A12-aAfFvTTOSQ/exec";

  const form = document.getElementById("rsvp-form");
  if (!form) return;
const successBox = document.getElementById("rsvp-success");
const leadText = document.querySelector(".rsvp-lead");

  const attendanceInput = document.getElementById("attendance");
  const statusBox = document.getElementById("form-status");
  const actionButtons = form.querySelectorAll(".rsvp-action-btn");

  const conditionalFields = [
    document.getElementById("guest-count"),
    document.getElementById("with-children"),
    document.getElementById("accommodation"),
  ];

function showSuccessBox(isConfirming) {
  if (!successBox) return;

  form.classList.add("is-hidden");

  if (leadText) {
    leadText.style.display = "none";
  }

  successBox.hidden = false;

  const title = successBox.querySelector("h3");
  const text = successBox.querySelector("p");

  if (title) {
    title.textContent = "Răspunsul tău a fost înregistrat";
  }

  if (text) {
    text.textContent = isConfirming
      ? "Îți mulțumim! Abia așteptăm să celebrăm împreună."
      : "Îți mulțumim pentru răspuns. Am notat că nu vei putea participa.";
  }
}


  function showStatus(message, type) {
    if (!statusBox) return;
    statusBox.hidden = false;
    statusBox.textContent = message;
    statusBox.className = `form-status is-visible ${type}`;
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.hidden = true;
    statusBox.textContent = "";
    statusBox.className = "form-status";
  }

  function setActiveButton(currentBtn) {
    actionButtons.forEach((btn) => btn.classList.remove("is-active"));
    currentBtn.classList.add("is-active");
  }

  function setConditionalRequired(isConfirming) {
    conditionalFields.forEach((field) => {
      if (!field) return;
      field.required = isConfirming;
    });
  }

  function getPayload() {
    const formData = new FormData(form);

    return {
      attendance: formData.get("attendance"),
      full_name: (formData.get("full_name") || "").toString().trim(),
      guest_count: formData.get("guest_count") || "",
      with_children: formData.get("with_children") || "",
      accommodation: formData.get("accommodation") || "",
      message: (formData.get("message") || "").toString().trim(),
      phone: (formData.get("phone") || "").toString().trim(),
    };
  }

  async function sendToGoogleSheets(payload) {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || "Nu am putut salva răspunsul.");
    }

    return result;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  actionButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      clearStatus();
      setActiveButton(button);

      const attendanceValue = button.dataset.attendance;
      const isConfirming = attendanceValue === "da";

      attendanceInput.value = attendanceValue;
      setConditionalRequired(isConfirming);

      if (!form.checkValidity()) {
        form.reportValidity();
        showStatus("Te rog completează câmpurile necesare.", "error");
        return;
      }

      const payload = getPayload();

      try {
        actionButtons.forEach((btn) => {
          btn.disabled = true;
        });
        showStatus("Se trimite răspunsul...", "success");

        await sendToGoogleSheets(payload);

        actionButtons.forEach((btn) => {
          btn.disabled = false;
        });

        showSuccessBox(isConfirming);
      } catch (error) {
        actionButtons.forEach((btn) => {
          btn.disabled = false;
        });

        showStatus(error.message || "A apărut o eroare la trimitere.", "error");
      }
    });
  });
});
