import React from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionManager } from './components/TransactionManager';
import { MonthlyTransactions } from './components/MonthlyTransactions';
import { MonthlyComparison } from './components/MonthlyComparison';
import { YearlyComparison } from './components/YearlyComparison';
import { CategoryAnalysis } from './components/CategoryAnalysis';
import { CSVImport } from './components/CSVImport';
import { SavingsOverview } from './components/SavingsOverview';
import { CreditCardOverview } from './components/CreditCardOverview';
import { NeuralBackground } from './components/NeuralBackground';
import { useStore } from './store';

function App() {
  const theme = useStore(state => state.theme);
  const neuralBackground = useStore(state => state.neuralBackground);

  return (
    <div className={theme} style={{ position: 'relative', minHeight: '100vh' }}>
      <NeuralBackground />
      <div className="relative text-gray-900 dark:text-gray-100 transition-colors">
        <Header />
        
        <main className="container mx-auto px-4 pt-28 pb-8 space-y-8">
          <section id="dashboard">
            <Dashboard />
          </section>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section id="monthly">
              <MonthlyComparison />
            </section>
            <section id="categories">
              <CategoryAnalysis />
            </section>
          </div>
          
          <section id="yearly">
            <YearlyComparison />
          </section>

          <section id="monthly-transactions">
            {/* <MonthlyTransactions /> */}
          </section>
          
          <section id="transactions">
            <TransactionManager />
          </section>
          
          <section id="savings">
            <SavingsOverview />
          </section>

          <section id="credit-card">
            <CreditCardOverview />
          </section>
          
          <section id="import">
            <CSVImport />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;