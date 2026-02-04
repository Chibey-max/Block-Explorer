(function () {
  const RPC_URL = "https://ethereum-rpc.publicnode.com";
  let rpcId = 1;

  async function rpc(method, params = []) {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id: rpcId++,
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
  }
  const blocksListEl = document.getElementById("blocksList");
  const txListEl = document.getElementById("txList");
  const detailContent = document.getElementById("detailContent");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const themeToggle = document.getElementById("themeToggle");

  const THEME = "explorer-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
    localStorage.setItem(THEME, theme);
  }

  themeToggle?.addEventListener("click", () => {
    const current = localStorage.getItem(THEME) || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });

  function hexToInt(hex) {
    return parseInt(hex, 16);
  }

  function weiToEth(weiHex) {
    return Number(BigInt(weiHex) / 10n ** 18n);
  }

  function short(hex, len = 20) {
    if (!hex) return "";
    return hex.slice(0, len) + "..." + hex.slice(-6);
  }

  function timeAgo(ts) {
    const diff = Math.floor(Date.now() / 1000 - ts);
    if (diff < 60) return diff + "s ago";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  }

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = txt;
    return e;
  }

 
  const getLatestBlockNumber = async () =>
    hexToInt(await rpc("eth_blockNumber"));

  const getBlockByNumber = async (num, full) =>
    rpc("eth_getBlockByNumber", ["0x" + num.toString(16), full]);

  const getBlockByHash = async (hash, full) =>
    rpc("eth_getBlockByHash", [hash, full]);

  const getTx = async (hash) => rpc("eth_getTransactionByHash", [hash]);

  const getReceipt = async (hash) => rpc("eth_getTransactionReceipt", [hash]);

  const getBalance = async (addr) => rpc("eth_getBalance", [addr, "latest"]);

  const getTxCount = async (addr) =>
    rpc("eth_getTransactionCount", [addr, "latest"]);

  

  async function loadLatestBlocks(count = 10) {
    blocksListEl.innerHTML = "";
    const latest = await getLatestBlockNumber();

    for (let i = 0; i < count; i++) {
      const block = await getBlockByNumber(latest - i, false);

      const item = el("div", "item");
      item.innerHTML = `
        <div class="i-left">
          <div>#${hexToInt(block.number)}</div>
          <div>${short(block.hash, 12)}</div>
        </div>
        <div class="i-right">
          <div>${block.transactions.length} tx</div>
          <div>${timeAgo(hexToInt(block.timestamp))}</div>
        </div>
      `;

      item.onclick = () => showBlock(hexToInt(block.number));
      blocksListEl.appendChild(item);
    }
  }


  async function scanRecentTxs(blocksToScan = 15) {
    txListEl.innerHTML = "";
    const latest = await getLatestBlockNumber();
    const found = [];

    for (let i = 0; i < blocksToScan; i++) {
      const block = await getBlockByNumber(latest - i, true);
      for (const tx of block.transactions.slice(-6)) {
        found.push(tx);
        if (found.length >= 20) break;
      }
      if (found.length >= 20) break;
    }

    for (const tx of found) {
      const row = el("div", "tx-item");
      row.innerHTML = `
        <div>${short(tx.hash, 12)}</div>
        <div>${short(tx.from, 12)}</div>
        <div>${tx.to ? short(tx.to, 12) : "contract"}</div>
        <div>${weiToEth(tx.value)} ETH</div>
      `;
      row.onclick = () => showTx(tx.hash);
      txListEl.appendChild(row);
    }
  }


  async function showBlock(input) {
    const block =
      typeof input === "number"
        ? await getBlockByNumber(input, true)
        : await getBlockByHash(input, true);

    detailContent.innerHTML = "";
    const wrap = el("div");
    wrap.appendChild(el("h3", "", `Block #${hexToInt(block.number)}`));

    wrap.innerHTML += `
      <div>Hash: ${block.hash}</div>
      <div>Txs: ${block.transactions.length}</div>
      <div>Gas Used: ${hexToInt(block.gasUsed)}</div>
      <div>Time: ${timeAgo(hexToInt(block.timestamp))}</div>
    `;

    for (const tx of block.transactions) {
      const row = el("div", "tx-row");
      row.innerHTML = `
        <div>${short(tx.hash, 12)}</div>
        <div>${short(tx.from, 12)}</div>
        <div>${tx.to ? short(tx.to, 12) : "contract"}</div>
        <div>${weiToEth(tx.value)} ETH</div>
      `;
      row.onclick = () => showTx(tx.hash);
      wrap.appendChild(row);
    }

    detailContent.appendChild(wrap);
  }

 

  async function showTx(hash) {
    const tx = await getTx(hash);
    const receipt = await getReceipt(hash);

    detailContent.innerHTML = `
      <h3>Tx ${short(tx.hash, 12)}</h3>
      <div>Block: ${hexToInt(tx.blockNumber)}</div>
      <div>From: ${tx.from}</div>
      <div>To: ${tx.to || "contract"}</div>
      <div>Value: ${weiToEth(tx.value)} ETH</div>
      <div>Status: ${
        receipt
          ? receipt.status === "0x1"
            ? "Success ✅"
            : "Fail"
          : "Pending"
      }</div>
    `;
  }


  async function showAddress(addr) {
    const balance = await getBalance(addr);
    const txCount = await getTxCount(addr);

    detailContent.innerHTML = `
      <h3>Address ${short(addr, 12)}</h3>
      <div>Balance: ${weiToEth(balance)} ETH</div>
      <div>Tx Count: ${hexToInt(txCount)}</div>
    `;
  }

  const isHexHash = (s) => /^0x[a-fA-F0-9]{64}$/.test(s);
  const isAddress = (s) => /^0x[a-fA-F0-9]{40}$/.test(s);
  const isNumber = (s) => /^[0-9]+$/.test(s);

  async function doSearch(q) {
    q = q.trim();
    if (!q) return;

    if (isNumber(q)) return showBlock(Number(q));

    if (isHexHash(q)) {
      const block = await getBlockByHash(q, false);
      return block ? showBlock(q) : showTx(q);
    }

    if (isAddress(q)) return showAddress(q);

    detailContent.textContent = "Unrecognized search input";
  }

  searchBtn?.addEventListener("click", () => doSearch(searchInput.value));
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch(searchInput.value);
  });


  (async function init() {
    applyTheme(localStorage.getItem(THEME) || "dark");
    await loadLatestBlocks(12);
    await scanRecentTxs();
  })();
})();

