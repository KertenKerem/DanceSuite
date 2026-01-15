function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '200px', backgroundColor: '#f0f0f0', padding: '20px' }}>
        <h2>Dashboard</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <a href="#home">Home</a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="#users">Users</a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="#settings">Settings</a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: '20px' }}>
        <header style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <h1>Welcome to DanceSuite!</h1>
        </header>
        <section>
          <p>This is the main content area of your dashboard.</p>
          <p>More features will be added here soon.</p>
        </section>
      </main>
    </div>
  )
}

export default App
