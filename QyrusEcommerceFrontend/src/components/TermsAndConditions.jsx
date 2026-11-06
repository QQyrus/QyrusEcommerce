import PageHeader from './PageHeader';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader icon="📜" eyebrow="Please read" title="Terms and Conditions" />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
            <p>
              By using this application, you agree to the following terms and conditions.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla accumsan, metus ultrices
              eleifend gravida, nulla nunc varius lectus, nec rutrum justo nibh eu lectus. Ut vulputate
              semper dui. Fusce erat odio, sollicitudin vel erat vel, interdum mattis neque.
            </p>
            <p>
              Additional terms and conditions text goes here. Make sure to include all the details that
              govern your application's use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
