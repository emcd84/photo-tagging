//Initialize firebase

const firebaseConfig = {
  apiKey: "AIzaSyC2_9vdhmmh2mH0mBKeHUXkFXXoSBxGNaI",
  authDomain: "whereswaldo-ebb48.firebaseapp.com",
  projectId: "whereswaldo-ebb48",
  storageBucket: "whereswaldo-ebb48.appspot.com",
  messagingSenderId: "669390081418",
  appId: "1:669390081418:web:8f0533dabf137f3707cc73",
};

firebase.initializeApp(firebaseConfig);

//Initialize firebase db

const db = firebase.firestore();

const imgContainer = document.querySelector("#img-container");

// Set all found properties to false
const characters = ["Waldo", "Wizard", "Odlaw"];
for (let i = 0; i < characters.length; i++) {
  db.collection("characters").doc(characters[i]).set(
    {
      found: false,
    },
    { merge: true }
  );
}

//Implement timer
let runTime = true;
const timerDiv = document.querySelector("#timer-text");
let seconds = 0;
setInterval(() => {
  if (runTime) {
    seconds++;
    timerDiv.textContent = seconds;
  }
}, 1000);

// TODO: Display leaderboard when leaderboard button is clicked
const leaderboardButton = document.querySelector("#leaderboardButton");
leaderboardButton.addEventListener("click", () => {
  displayLeaderboard();
});

//on image mouse click
const img = document.querySelector("#image");
img.onclick = (e) => {
  const imgContainer = document.querySelector("#img-container");

  // Remove all popupDiv instances
  const popupDivList = document.querySelectorAll(".popupDiv");
  if (popupDivList) {
    for (let i = 0; i < popupDivList.length; i++) {
      imgContainer.removeChild(popupDivList[i]);
    }
  }

  // Get mouse click coordinates
  const x = e.pageX - e.target.offsetLeft;
  const y = e.pageY - e.target.offsetTop;

  // Create popup div
  const popupDiv = document.createElement("div");
  popupDiv.className = "popupDiv";
  const topHeight = document.querySelector("#top-div").clientHeight;
  popupDiv.style.top = y - 25 - topHeight + "px";
  popupDiv.style.left = x - 25 + "px";

  // Create target box and add to popup div
  const targetBox = document.createElement("div");
  targetBox.className = "targetBox";
  popupDiv.appendChild(targetBox);

  // Create menu and add to popup div
  const dropdownMenu = document.createElement("div");
  dropdownMenu.className = "dropdownMenu";

  // // Create waldo option
  // const waldoOption = document.createElement('div');
  // waldoOption.className = 'dropdownOption';
  // waldoOption.textContent = 'Waldo';
  // waldoOption.setAttribute('data-character', 'Waldo');
  // waldoOption.addEventListener('click', () => {
  //     dropdownClickHandler(waldoOption, popupDiv);
  // });

  dropdownMenu.appendChild(createDropdownOption("Waldo", popupDiv));
  dropdownMenu.appendChild(createDropdownOption("Wizard", popupDiv));
  dropdownMenu.appendChild(createDropdownOption("Odlaw", popupDiv));

  popupDiv.appendChild(dropdownMenu);

  imgContainer.appendChild(popupDiv);
};

function createDropdownOption(characterName, popupDiv) {
  const option = document.createElement("div");
  option.className = "dropdownOption";
  option.textContent = characterName;
  option.setAttribute("data-character", characterName);
  option.addEventListener("click", () => {
    dropdownClickHandler(option, popupDiv);
  });
  return option;
}

function dropdownClickHandler(e, popupDiv) {
  const popupDivTop = parseInt(
    window.getComputedStyle(popupDiv).top.slice(0, -2)
  );
  const popupDivLeft = parseInt(
    window.getComputedStyle(popupDiv).left.slice(0, -2)
  );
  // Remove popup div
  const imgContainer = document.querySelector("#img-container");
  imgContainer.removeChild(popupDiv);

  // Fetch character coordinates from database
  const docRef = db
    .collection("characters")
    .doc(e.getAttribute("data-character"));
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const img = document.querySelector("#image");
        const imgWidth = window
          .getComputedStyle(img)
          .getPropertyValue("width")
          .slice(0, -2);
        const imgHeight = window
          .getComputedStyle(img)
          .getPropertyValue("height")
          .slice(0, -2);

        const characterData = doc.data();
        const characterLeft = (characterData.left / 1348) * imgWidth;
        let characterRight = (characterData.right / 1348) * imgWidth;
        let characterTop = (characterData.top / 847.317) * imgHeight;
        let characterBottom = (characterData.bottom / 847.317) * imgHeight;
        const topBottomDiff = characterBottom - characterTop + 25;
        const leftRightDiff = characterRight - characterLeft;
        if (
          popupDivLeft - leftRightDiff < characterLeft &&
          popupDivLeft + 50 + leftRightDiff > characterRight &&
          popupDivTop - topBottomDiff < characterTop &&
          popupDivTop + 50 + topBottomDiff > characterBottom
        ) {
          const markerBox = document.createElement("div");
          markerBox.className = "markerBox";
          markerBox.style.top = `${popupDivTop}px`;
          markerBox.style.left = `${popupDivLeft}px`;
          imgContainer.appendChild(markerBox);

          db.collection("characters").doc(e.getAttribute("data-character")).set(
            {
              found: true,
            },
            { merge: true }
          );

          //Check if all characters are found, then stop timer
          let allTrue = true;
          db.collection("characters")
            .get()
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                console.log(doc.data().found);
                if (doc.data().found === false) allTrue = false;
              });
              if (allTrue) {
                runTime = false;

                // Pop up box to ask for name to record score
                const scoreRecordBox = document.createElement("div");
                scoreRecordBox.setAttribute("id", "scoreRecordBox");
                const scoreRecordHeader = document.createElement("h1");
                scoreRecordHeader.setAttribute("id", "scoreRecordHeader");
                scoreRecordHeader.textContent =
                  "Well done! Enter your name and your score will be recorded!";
                scoreRecordBox.appendChild(scoreRecordHeader);

                const scoreInputDiv = document.createElement("div");
                scoreInputDiv.setAttribute("id", "scoreInputDiv");
                const scoreInputLabel = document.createElement("label");
                scoreInputLabel.setAttribute("id", "scoreInputLabel");
                scoreInputLabel.textContent = "Name:";
                scoreInputDiv.appendChild(scoreInputLabel);
                const scoreInput = document.createElement("input");
                scoreInput.setAttribute("id", "scoreInput");
                scoreInputDiv.appendChild(scoreInput);
                scoreRecordBox.appendChild(scoreInputDiv);

                scoreRecordButton = document.createElement("button");
                scoreRecordButton.setAttribute("id", "scoreRecordButton");
                scoreRecordButton.textContent = "Submit Score";
                scoreRecordButton.addEventListener("click", () => {
                  db.collection("scores").add({
                    name: scoreInput.value,
                    score: seconds,
                  });

                  const newScoreRecordBox =
                    document.querySelector("#scoreRecordBox");
                  imgContainer.removeChild(newScoreRecordBox);
                });
                scoreRecordBox.appendChild(scoreRecordButton);

                imgContainer.appendChild(scoreRecordBox);
              }
            });
        }
      } else {
        console.log("No document found");
      }
    })
    .catch((error) => {
      console.error("Error getting document:  ", error);
    });
}

// const waldoOption = document.createElement('div');
// waldoOption.className = 'waldoOption';
// waldoOption.textContent = 'Waldo';
// waldoOption.setAttribute('data-character', 'Waldo');
// dropdownClickHandler(waldoOption);

function getImgCoordinates(x, y) {
  console.log("x: " + x);
  const topHeight = document.querySelector("#top-div").clientHeight;
  console.log("y: " + (y - topHeight));
}

function displayLeaderboard() {
  const leaderboardDiv = document.createElement("div");
  leaderboardDiv.setAttribute("id", "leaderboardDiv");

  const leaderboardHeader = document.createElement("h1");
  leaderboardHeader.setAttribute("id", "leaderboardHeader");
  leaderboardHeader.textContent = "Leaderboard:";
  leaderboardDiv.appendChild(leaderboardHeader);

  db.collection("scores")
    .orderBy("score")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        leaderboardDiv.appendChild(
          createLeaderboardEntry(doc.data().name, doc.data().score)
        );
      });

      const closeButton = document.createElement("button");
      closeButton.setAttribute("id", "leaderboardCloseButton");
      closeButton.textContent = "Close";
      closeButton.addEventListener("click", () => {
        const newLeaderboardDiv = document.querySelector("#leaderboardDiv");
        imgContainer.removeChild(newLeaderboardDiv);
      });
      leaderboardDiv.appendChild(closeButton);
    });

  imgContainer.appendChild(leaderboardDiv);
}

function createLeaderboardEntry(name, score) {
  const leaderboardEntryDiv = document.createElement("div");
  leaderboardEntryDiv.className = "leaderboardEntryDiv";

  const entryText = document.createElement("h1");
  entryText.className = "entryText";
  entryText.textContent = `${name}: ${score} seconds`;
  leaderboardEntryDiv.appendChild(entryText);

  return leaderboardEntryDiv;
}
