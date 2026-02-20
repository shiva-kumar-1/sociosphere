const handleGoogleLogin = () => {
    window.location.href =
        "http://localhost:5000/api/auth/google";
};
<button
    onClick={handleGoogleLogin}
    className="w-full py-3 rounded-xl font-semibold border border-gray-300
             flex items-center justify-center gap-2
             hover:bg-gray-50 transition"
>
    <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="google"
        className="w-5 h-5"
    />
    Continue with Google
</button>
