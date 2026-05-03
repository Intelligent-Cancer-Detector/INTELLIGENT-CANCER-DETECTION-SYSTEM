export async function loadLayout() {
  const sidebarHtml = await fetch("../include/_sidebar.html").then(r => r.text());
  document.getElementById("sidebar-container").innerHTML = sidebarHtml;

  if (window.initSidebar) window.initSidebar();

  const headerHtml = await fetch("../include/_header.html").then(r => r.text());
  document.getElementById("header-container").innerHTML = headerHtml;

  if (window.syncHeaderWithDatabase) window.syncHeaderWithDatabase();
}