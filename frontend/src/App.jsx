import React, { useState } from 'react';
import './App.css';


// ============================================================
// Backend API URL
// ============================================================

const API_URL =
  "https://atm-simulation-python-project.onrender.com/api";


function App() {

  // ==========================================================
  // State
  // ==========================================================

  const [screen, setScreen] = useState('login');

  const [cardNumber, setCardNumber] =
    useState('4532000011112222');

  const [pin, setPin] =
    useState('1234');

  const [user, setUser] =
    useState(null);

  const [message, setMessage] =
    useState('');

  const [actionType, setActionType] =
    useState('');

  const [amount, setAmount] =
    useState('');

  const [selectedAccount, setSelectedAccount] =
    useState('Checking');

  const [loading, setLoading] =
    useState(false);


  // ==========================================================
  // Login
  // ==========================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setMessage('');
    setLoading(true);

    try {

      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          card_number: cardNumber,
          pin: pin
        })
      });


      const data = await response.json();


      if (response.ok) {

        setUser(data);

        setScreen('menu');

        setMessage('');

      } else {

        setMessage(
          data.detail || 'Login failed.'
        );

      }

    } catch (error) {

      console.error('Login error:', error);

      setMessage(
        'Connection error. Please check the backend.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // Transaction
  // ==========================================================

  const handleTransaction = async (e) => {

    e.preventDefault();

    setMessage('');

    const numericAmount = parseFloat(amount);


    // Validate amount on frontend
    if (
      isNaN(numericAmount) ||
      numericAmount <= 0
    ) {

      setMessage(
        'Please enter a valid amount greater than zero.'
      );

      return;
    }


    setLoading(true);


    try {

      const response = await fetch(
        `${API_URL}/${actionType}`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            card_number: cardNumber,
            account_type: selectedAccount,
            amount: numericAmount
          })
        }
      );


      const data = await response.json();


      if (response.ok) {

        // Update user's balance locally
        setUser({
          ...user,

          accounts: {
            ...user.accounts,

            [selectedAccount]:
              data.new_balance
          }
        });


        setMessage(
          `${data.message}! New ${selectedAccount} balance: $${Number(
            data.new_balance
          ).toFixed(2)}`
        );


        setAmount('');

      } else {

        setMessage(
          data.detail || 'Transaction failed.'
        );

      }

    } catch (error) {

      console.error(
        'Transaction error:',
        error
      );

      setMessage(
        'Transaction failed. Unable to connect to the backend.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // Logout
  // ==========================================================

  const handleLogout = () => {

    setUser(null);

    setPin('');

    setAmount('');

    setMessage('');

    setActionType('');

    setScreen('login');

  };


  // ==========================================================
  // Back to Menu
  // ==========================================================

  const backToMenu = () => {

    setActionType('');

    setAmount('');

    setMessage('');

    setScreen('menu');

  };


  // ==========================================================
  // LOGIN SCREEN
  // ==========================================================

  if (screen === 'login') {

    return (

      <div className="atm-container">

        <div className="atm-machine">

          <h1>
            Python Global Bank
          </h1>

          <h2>
            ATM
          </h2>


          <form onSubmit={handleLogin}>

            <div className="form-group">

              <label>
                Card Number
              </label>

              <input
                type="text"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value)
                }
                placeholder="Enter card number"
                maxLength="16"
              />

            </div>


            <div className="form-group">

              <label>
                PIN
              </label>

              <input
                type="password"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value)
                }
                placeholder="Enter PIN"
                maxLength="4"
              />

            </div>


            {message && (

              <div className="message error">
                {message}
              </div>

            )}


            <button
              type="submit"
              disabled={loading}
            >

              {loading
                ? 'Connecting...'
                : 'Insert Card'}

            </button>

          </form>


          <p className="demo-info">

            Demo Card:
            <br />

            4532000011112222

            <br />

            PIN: 1234

          </p>

        </div>

      </div>

    );
  }


  // ==========================================================
  // MAIN MENU
  // ==========================================================

  if (screen === 'menu') {

    return (

      <div className="atm-container">

        <div className="atm-machine">

          <h1>
            Python Global Bank
          </h1>

          <h2>
            Welcome, {user?.name}
          </h2>


          <div className="accounts">

            <h3>
              Your Accounts
            </h3>


            {user?.accounts &&
              Object.entries(user.accounts).map(
                ([account, balance]) => (

                  <div
                    className="account-card"
                    key={account}
                  >

                    <span>
                      {account}
                    </span>

                    <strong>
                      ${Number(balance).toFixed(2)}
                    </strong>

                  </div>

                )
              )}

          </div>


          {message && (

            <div className="message success">
              {message}
            </div>

          )}


          <div className="menu-buttons">

            <button
              onClick={() => {
                setActionType('withdraw');
                setMessage('');
                setScreen('transaction');
              }}
            >
              Withdraw
            </button>


            <button
              onClick={() => {
                setActionType('deposit');
                setMessage('');
                setScreen('transaction');
              }}
            >
              Deposit
            </button>


            <button
              onClick={handleLogout}
            >
              Exit
            </button>

          </div>

        </div>

      </div>

    );
  }


  // ==========================================================
  // TRANSACTION SCREEN
  // ==========================================================

  if (screen === 'transaction') {

    return (

      <div className="atm-container">

        <div className="atm-machine">

          <h1>
            Python Global Bank
          </h1>


          <h2>
            {actionType === 'withdraw'
              ? 'Withdraw Money'
              : 'Deposit Money'}
          </h2>


          <form
            onSubmit={handleTransaction}
          >

            <div className="form-group">

              <label>
                Select Account
              </label>

              <select
                value={selectedAccount}
                onChange={(e) =>
                  setSelectedAccount(
                    e.target.value
                  )
                }
              >

                <option value="Checking">
                  Checking
                </option>

                <option value="Savings">
                  Savings
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Amount
              </label>

              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="Enter amount"
                min="1"
                step="0.01"
              />

            </div>


            {message && (

              <div className="message error">
                {message}
              </div>

            )}


            <button
              type="submit"
              disabled={loading}
            >

              {loading
                ? 'Processing...'
                : actionType === 'withdraw'
                  ? 'Withdraw'
                  : 'Deposit'}

            </button>


            <button
              type="button"
              onClick={backToMenu}
              disabled={loading}
            >
              Back to Menu
            </button>

          </form>

        </div>

      </div>

    );

  }


  // ==========================================================
  // FALLBACK
  // ==========================================================

  return null;
}


export default App;