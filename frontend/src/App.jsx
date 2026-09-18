import React, { useState } from 'react';
import './App.css';

const API_URL = "https://atm-simulation-python-project.onrender.com"; // Replace with your backend URL

function App() {
  const [screen, setScreen] = useState('login'); // login, menu, action
  const [cardNumber, setCardNumber] = useState('4532000011112222');
  const [pin, setPin] = useState('1234');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  const [actionType, setActionType] = useState(''); // withdraw, deposit
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('Checking');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_number: cardNumber, pin })
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data);
        setScreen('menu');
        setMessage('');
      } else {
        setMessage(data.detail);
      }
    } catch (error) {
      setMessage("Connection error. Is the backend running?");
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/${actionType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_number: cardNumber,
          account_type: selectedAccount,
          amount: parseFloat(amount)
        })
      });
      const data = await response.json();

      if (response.ok) {
        // Update local state with new balance
        setUser({
          ...user,
          accounts: {
            ...user.accounts,
            [selectedAccount]: data.new_balance
          }
        });
        setMessage(`Success! New ${selectedAccount} balance: $${data.new_balance}`);
        setAmount('');
      } else {
        setMessage(data.detail);
      }
    } catch (error) {
      setMessage("Transaction failed. System error.");
    }
  };

  const logout = () => {
    setUser(null);
    setPin('');
    setScreen('login');
    setMessage('Please take your card.');
  };

  return (
    <div className="atm-container">
      <div className="atm-screen">
        <h2>Python Global Bank</h2>

        {message && <div className="alert">{message}</div>}

        {/* --- LOGIN SCREEN --- */}
        {screen === 'login' && (
          <form onSubmit={handleLogin} className="form-group">
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <input
              type="password"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button type="submit">Insert Card</button>
          </form>
        )}

        {/* --- MAIN MENU --- */}
        {screen === 'menu' && user && (
          <div className="menu-grid">
            <h3>Welcome, {user.name}</h3>
            <div className="balances">
              <p>Checking: ${user.accounts.Checking}</p>
              <p>Savings: ${user.accounts.Savings}</p>
            </div>
            <button onClick={() => { setScreen('action'); setActionType('withdraw'); setMessage(''); }}>Withdraw Cash</button>
            <button onClick={() => { setScreen('action'); setActionType('deposit'); setMessage(''); }}>Deposit Cash</button>
            <button onClick={logout} className="cancel-btn">Return Card</button>
          </div>
        )}

        {/* --- ACTION SCREEN (Withdraw/Deposit) --- */}
        {screen === 'action' && (
          <form onSubmit={handleTransaction} className="form-group">
            <h3>{actionType.toUpperCase()}</h3>
            <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
            </select>
            <input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
            <button type="submit">Confirm</button>
            <button type="button" onClick={() => { setScreen('menu'); setMessage(''); }} className="cancel-btn">Back to Menu</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;