import React from 'react';

const STEPS = ['Cart', 'Address', 'Payment', 'Confirmation'];

// Purely visual progress indicator shared by the checkout flow pages so the
// multi-step journey reads as one connected experience instead of separate screens.
const CheckoutSteps = ({ current }) => {
  const currentIndex = STEPS.indexOf(current);

  return (
    <div className="flex items-center justify-center max-w-xl mx-auto mb-8">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  active
                    ? 'bg-violet-600 text-white ring-4 ring-violet-100'
                    : done
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-violet-700' : 'text-gray-400'}`}>{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-10 md:w-16 mx-1 mb-5 ${done ? 'bg-violet-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CheckoutSteps;
