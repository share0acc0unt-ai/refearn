import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, baseURL: 'http://localhost:3005' }));

async function runTest() {
    try {
        console.log('1. Seeding Database...');
        const seedRes = await client.post('/api/seed');
        console.log('✅ Database seeded', seedRes.status);

        console.log('2. Signing up new user...');
        const signupRes = await client.post('/api/auth/signup', {
            name: 'Test User',
            username: 'testuser_' + Date.now(),
            whatsapp: '1234567890_' + Date.now(),
            password: 'password123',
            otpCode: 'TESTOTP123'
        });
        console.log('✅ Signup successful:', signupRes.data.user.username);

        console.log('3. Logging in...');
        const loginRes = await client.post('/api/auth/login', {
            username: signupRes.data.user.username,
            password: 'password123'
        });
        console.log('✅ Login successful');

        console.log('4. Checking /api/auth/me...');
        const meRes = await client.get('/api/auth/me');
        console.log('✅ Me API successful:', meRes.data.user.username);

    } catch (error) {
        console.error('❌ Test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

runTest();
