const links = document.querySelectorAll(".tab-link");
const panes = document.querySelectorAll(".tab-pane");

links.forEach(link => {
  link.addEventListener("click", () => {
    links.forEach(l => l.classList.remove("active"));
    panes.forEach(pane => pane.classList.remove("active"));

    link.classList.add("active");
    document.getElementById(link.dataset.tab).classList.add("active");
  });
});

// Select only the FAQ questions
let faqQuestions = document.querySelectorAll("#faq .question");

faqQuestions.forEach(question => {
  question.addEventListener("click", event => {
    const active = document.querySelector("#faq .question.active");
    if(active && active !== question ) {
      active.classList.toggle("active");
      active.nextElementSibling.style.maxHeight = 0;
    }
    question.classList.toggle("active");
    const answer = question.nextElementSibling;
    if(question.classList.contains("active")){
      answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
      answer.style.maxHeight = 0;
    }
  });
});

