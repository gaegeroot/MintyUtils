<script>
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    
    let processing = false;
</script>

<div class="container">
    <h1>Test Stripe Invoice Creation</h1>
    
    <div class="test-details">
        <h2>Test Values:</h2>
        <ul>
            <li><strong>Customer Email:</strong> test@example.com</li>
            <li><strong>Customer Name:</strong> John Doe</li>
            <li><strong>Estimated Price:</strong> $2,000</li>
            <li><strong>Deposit Amount:</strong> $500 (25%)</li>
        </ul>
    </div>

    <!-- <form method="POST" action="?/testInvoice" use:enhance={() => {
        processing = true;
        return async ({ result, update }) => {
            processing = false;
            await update();
        };
    }}>
        <button type="submit" disabled={processing}>
            {processing ? 'Creating Invoice...' : 'Create Test Invoice'}
        </button>
    </form> -->

    <form method="POST" action="?/testEmail" use:enhance={() => {
        processing = true;
        return async ({ result, update }) => {
            processing = false;
            await update();
        };
    }}>
        <button type="submit" disabled={processing}>
            {processing ? 'Sending test email...' : 'Send test email'}
        </button>
    </form>

    {#if $page.form?.success}
        <div class="success">
            <h3>✅ Invoice Created Successfully!</h3>
            <p><strong>Invoice ID:</strong> {$page.form.invoiceId}</p>
            <p><strong>Customer ID:</strong> {$page.form.customerId}</p>
            <p><strong>Deposit Amount:</strong> ${$page.form.depositAmount}</p>
            
            <a href={$page.form.invoiceUrl} target="_blank" class="invoice-link">
                View Invoice (Opens in new tab)
            </a>
            
            <p class="note">
                This is a real invoice in your Stripe account. 
                You can view it in test mode at 
                <a href="https://dashboard.stripe.com/test/invoices" target="_blank">
                    Stripe Dashboard
                </a>
            </p>
        </div>
    {:else if $page.form?.error}
        <div class="error">
            <h3>❌ Error Creating Invoice</h3>
            <p><strong>Error:</strong> {$page.form.error}</p>
            <p><strong>Details:</strong> {$page.form.errorDetails}</p>
            
            <details>
                <summary>Troubleshooting Tips</summary>
                <ul>
                    <li>Make sure STRIPE_SECRET_KEY is set in your .env file</li>
                    <li>Verify you're using a test key (starts with sk_test_)</li>
                    <li>Check the console logs for more details</li>
                    <li>Ensure the Stripe package is installed: npm install stripe</li>
                </ul>
            </details>
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        font-family: system-ui, -apple-system, sans-serif;
    }
    
    h1 {
        color: #333;
        margin-bottom: 2rem;
    }
    
    .test-details {
        background: #f5f5f5;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
    }
    
    .test-details ul {
        list-style: none;
        padding: 0;
    }
    
    .test-details li {
        padding: 0.5rem 0;
    }
    
    button {
        background: #635bff;
        color: white;
        padding: 1rem 2rem;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    button:hover:not(:disabled) {
        background: #4f46e5;
    }
    
    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        padding: 2rem;
        border-radius: 8px;
        margin-top: 2rem;
    }
    
    .success h3 {
        color: #155724;
        margin-top: 0;
    }
    
    .invoice-link {
        display: inline-block;
        background: #635bff;
        color: white;
        padding: 0.75rem 1.5rem;
        text-decoration: none;
        border-radius: 6px;
        margin: 1rem 0;
        font-weight: 600;
    }
    
    .invoice-link:hover {
        background: #4f46e5;
    }
    
    .note {
        font-size: 0.9rem;
        color: #666;
        margin-top: 1rem;
    }
    
    .error {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        padding: 2rem;
        border-radius: 8px;
        margin-top: 2rem;
    }
    
    .error h3 {
        color: #721c24;
        margin-top: 0;
    }
    
    details {
        margin-top: 1rem;
        padding: 1rem;
        background: white;
        border-radius: 4px;
    }
    
    summary {
        cursor: pointer;
        font-weight: 600;
        color: #721c24;
    }
    
    details ul {
        margin-top: 0.5rem;
    }
</style>