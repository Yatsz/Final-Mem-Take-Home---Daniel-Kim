document.addEventListener('DOMContentLoaded', () => {

  const commonWords = ["a", "an", "the", "and", "or", "but", "if", "of", "to", "in", "on", "at", "with", "by", "for", "from", "up", "about", "as", "into", "onto", "than", "after", "before", "during", "under", "over", "between", "among", "since", "until", "while", "although", "where", "when", "who", "whom", "whose", "that", "which", "whose"];

  const commonWordsSet = new Set(commonWords);
  var counter = 0;
  var check = false;
  var topThreeWords;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    }).then(function (results) {
      const textContent = results[0].result;

      const words = textContent.split(' ');

      const wordCounts = {};
      for (let i = 0; i < words.length; i++) {
        const word = words[i].toLowerCase();
        if (!wordCounts[word]) {
          wordCounts[word] = 0;
          counter++;
        }
        if (commonWordsSet.has(word) || word.length<3) {
          wordCounts[word]--;
          counter--;
        }
        wordCounts[word]++;
        
      }
      if(counter >= 3)
      {
        check = true;
      }
      else
      {
        check = false;
      }
      const wordCountPairs = Object.entries(wordCounts);

      wordCountPairs.sort((a, b) => b[1] - a[1]);
      topThreeWords = wordCountPairs.slice(0, 3);
      
    


    }).catch(function (error) {
      const errorMessage = document.getElementById('error-message');
      errorMessage.classList.add('error');
      errorMessage.textContent = 'An error occurred while retrieving the common words.';
    });
  });




  const printButton = document.getElementById('create-mem');
  const printAll = document.getElementById('create-all');
  const note = document.getElementById('notes');
  const api_key = document.getElementById('keys');


  const apiUrl = "https://api.mem.ai/v0/mems"



  printButton.addEventListener('click', async () => {

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;
    const title = tab.title;
    const bearer = 'ApiAccessToken ' + api_key.value
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': bearer
    };
    var input = title + "\n\n" + "URL: " + url + "\n\n" + "Notes: " + note.value
    if (document.getElementById('my-check').checked) {

      input += " - Top three common words from tab: " /* add three words */
      if(check)
      {
        topThreeWords.forEach((wordCountPair) => {
          input += " - " + `${wordCountPair[0]}`;
        });
      }
      else{
        input += " Not enough valid words"
      }



    }
    const memData = {
      content: input
    };
    console.log(url);
    fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(memData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status + ' ' + response.statusText);
        }
        return response.json();
      })
      .then(data => console.log(data))
      .catch(error => console.error(error))
  });

  printAll.addEventListener('click', async () => {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      var input = "";
      for (let tab of tabs) {
        input += tab.title + "\n\n" + "URL: " + tab.url + "\n\n\n" + "-----------\n\n";
      }
      input += "Notes: " + note.value;
      const bearer = 'ApiAccessToken ' + api_key.value
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': bearer
      };
      if (document.getElementById('my-check').checked) {

        input += " - Top three common words from tab: " /* add three words */
        if(check)
      {
        topThreeWords.forEach((wordCountPair) => {
          input += " - " + `${wordCountPair[0]}`;
        });
      }
      else{
        input += " Not enough valid words"
      }



      }
      const memData = {
        content: input
      };
      fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(memData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(response.status + ' ' + response.statusText);
          }
          return response.json();
        })
        .then(data => console.log(data))
        .catch(error => console.error(error))

    });
  })

});

