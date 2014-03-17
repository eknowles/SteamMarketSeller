// Saves options to localStorage.
function save_options() {
    var profileurlid = $('#profileID').val();
    chrome.storage.local.set({'profileID': profileurlid}, function () {
    });
}
// Restores select box state to saved value from localStorage.
function restore_options() {
    chrome.storage.local.get("profileID", function (fetchedData) {
        uid = fetchedData.profileID
        $("#profileID").val(uid);
    });
}


$(document).ready(function () {
    restore_options();
});
document.querySelector('#saveSettings').addEventListener('click', save_options);