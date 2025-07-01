import React from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

const ResetPasswordPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
            <ResetPasswordForm />
        </div>
    );
};

export default ResetPasswordPage;