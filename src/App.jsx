import { useState } from 'react';
import axios from 'axios';
import './App.css'

const App = () => {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
          const response = await axios.post('https://7376-197-237-130-155.ngrok-free.app/pay', {
              phone,
              amount
          });
          console.log('Payment Response:', response.data);
          alert('Payment initiated! Check your phone for prompt.');

          // Reset form fields
          setPhone('');
          setAmount('');
      } catch (error) {
          console.error('Error initiating payment:', error);
          alert('Error initiating payment. Please try again.');
      } finally {
          setIsLoading(false);
      }
  };

  return (
      <div>
          <h1>M-pesa Daraja Trial</h1>
          <form onSubmit={handlePayment} className = "form">
              <div>
                  <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="Phone: 2547XXXXXXXX"
                      required
                      className='input'
                  />
              </div>
              <div>
                  <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      placeholder="Amount in KSh"
                      required
                      className='input' 
                  />
              </div>
              <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Pay Now'}
              </button>
          </form>
      </div>
  );
};

export default App