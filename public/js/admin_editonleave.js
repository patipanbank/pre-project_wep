
// loading image
$(document).ready(function () {
    // Existing code for fetching and displaying profile data
    const data_id = new URLSearchParams(window.location.search).get(
      "data_id"
    ); // Get data_id from URL
    // Fetch profile data for the given data_id
    fetch(`/data/images/${data_id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          $("#imgt").attr("src", data.image);
          $("#prof-name").text(data.name);
          $("#prof-email").text(data.email);
          $("#prof-major").text(data.major);
          $("#prof-tel").text(data.tel);
        }
      })
      .catch((error) =>
        console.error("Error fetching profile data:", error)
      );
  });