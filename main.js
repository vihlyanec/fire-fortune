(() => {
  setTimeout(async () => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.expand();
    }

    function showBackButton() {
      if (!tg) {
        return;
      }
      tg?.MainButton.setText("Забрать подарок")
        .show()
        .onClick(() => {
          tg.close();
          webviewClose();
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const clientId = +urlParams.get("id") || 1545106315;

    const userVariables = await getUserVariables(clientId);
    let isGetPrize = !userVariables;
    let { a1, a2, a3, a4, a5, a6, a7, a8, prizes: receivedPrizes } = userVariables;
    let availableSpins = userVariables.available_spins;
    let dealSpins = userVariables.deal_spins;
    let commonPrizeCount = 0;

    const prizes = [
      { key: "a1", text: "Напечатанный Ежедневник", dropChance: +a1 > 0 ? 5 : 0 },
      { key: "a2", text: "Карты для пар", dropChance: +a2 > 0 ? 8 : 0 },
      { key: "a3", text: "Скидка 50% на курс «Говорим откровенно»", dropChance: +a3 > 0 ? 7 : 0 },
      { key: "a4", text: "Консультация с Джемой", dropChance: +a4 > 0 ? 1 : 0 },
      { key: "a5", text: "Доступ в Семью на месяц для вас или вашего друга", dropChance: +a5 > 0 ? 7 : 0 },
      { key: "a6", text: "Сертификат в SPA", dropChance: +a6 > 0 ? 5 : 0 },
      { key: "a7", text: "Видео про коммуникацию (безлимит)", dropChance: 35 },
      { key: "a8", text: "Офлайн встреча в Москве с Джемой", dropChance: +a8 > 0 ? 35 : 0 }
    ];

    function filterPrizes() {
      return prizes.filter(prize => !receivedPrizes.includes(prize.key));
    }

    function dropPrize() {
      const filteredPrizes = filterPrizes();
      const total = filteredPrizes.reduce((acc, item) => acc + item.dropChance, 0);
      const chance = Math.random() * total;
      let current = 0;
      for (let i = 0; i < filteredPrizes.length; i++) {
        if (current <= chance && chance < current + filteredPrizes[i].dropChance) {
          return filteredPrizes[i];
        }
        current += filteredPrizes[i].dropChance;
      }
      return filteredPrizes[filteredPrizes.length - 1];
    }

    function setSpinsCount() {
      availableSpins -= 1;
      dealSpins += 1;
      if (availableSpins <= 0) {
        isGetPrize = true;
        document.body.classList.add("no-spin");
      }
    }

    async function sendPrizeToBot(prize) {
      return await fetch("https://chatter.salebot.pro/api/da37e22b33eb13cc4cabaa04dfe21df9/callback", {
        method: "POST",
        body: JSON.stringify({
          message: `приз_${prize.key}`,
          client_id: clientId
        })
      });
    }

    function showPrizePopup(prize) {
      popupElem.classList.remove("hide");
      document.querySelector(`.prize-${prize.key}`).classList.remove("hide");
      console.log(prize);
    }

    function onPhoneClick(e) {
      if (isGetPrize) {
        return;
      }
      isGetPrize = true;
      e.target.classList.add("active");
      const prize = dropPrize();
      setTimeout(async () => {
        showPrizePopup(prize);
        showBackButton();
        await sendPrizeToBot(prize);
        setSpinsCount();
      }, 800);
    }

    const phoneElems = document.querySelectorAll(".phone");
    phoneElems.forEach(el => {
      el.addEventListener("click", onPhoneClick);
    });
  }, 0);
})();
