# FoodLink - Zero Hunger Platform

A React web platform that connects people in need of food with donors and NGOs to address Zero Hunger (SDG 2).

## 🎯 Mission

FoodLink creates a transparent bridge between compassionate donors and communities in need, ensuring efficient food distribution through verified NGOs.

## ✨ Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Role-Based Access**: Donors, NGOs, and Beneficiaries
- **Food Request Management**: Submit and track food assistance requests
- **Payment Integration**: Flutterwave and Paystack payment gateways
- **Transparency Feed**: Real-time tracking of donations and distributions
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **AI Chatbot**: Claude-powered assistance for users

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: React Hooks + Context API
- **Payment**: Flutterwave, Paystack APIs
- **AI**: Claude API
- **Deployment**: Bolt.new
- **Monitoring**: Morel

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account
- Payment gateway accounts (Flutterwave/Paystack)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd foodlink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Payment Gateway Configuration
   VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
   VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

   # Claude AI Configuration
   VITE_CLAUDE_API_KEY=your_claude_api_key
   ```

4. **Set up Supabase Database**
   - Create a new Supabase project
   - Run the SQL script from `supabase-schema.sql` in your Supabase SQL editor
   - Configure Row Level Security (RLS) policies

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

1. **Run the schema script** in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase-schema.sql
   ```

2. **Verify tables created**:
   - users
   - ngos
   - requests
   - donations
   - transparency_feed
   - programs
   - program_beneficiaries

3. **Check RLS policies** are enabled and configured correctly

## 💳 Payment Integration

### Flutterwave
1. Sign up at [Flutterwave](https://flutterwave.com)
2. Get your public key from the dashboard
3. Add to environment variables

### Paystack
1. Sign up at [Paystack](https://paystack.com)
2. Get your public key from the dashboard
3. Add to environment variables

## 🔐 Authentication

The app uses Supabase Auth with the following user roles:
- **Donor**: Can browse requests and make donations
- **NGO**: Can manage food requests and programs
- **Beneficiary**: Can submit food assistance requests

## 📱 User Flow

1. **Beneficiary** signs up → submits food request
2. **NGO** verifies and approves request
3. **Donor** browses requests → makes donation
4. **Payment** processed through gateway
5. **NGO** distributes food → updates status
6. **Transparency feed** shows impact

## 🎨 Customization

### Colors
Modify `tailwind.config.js` to change the color scheme:
```js
colors: {
  primary: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  }
}
```

### Components
All components are modular and can be easily customized in the `src/components/` directory.

## 🚀 Deployment

### Bolt.new
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 📊 Monitoring

### Morel Integration
1. Sign up at [Morel](https://morel.io)
2. Add your API key to environment variables
3. Monitor app performance and errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Blockchain transparency
- [ ] Integration with food banks
- [ ] Emergency response system

## 🙏 Acknowledgments

- United Nations SDG 2 (Zero Hunger)
- Supabase for backend infrastructure
- Flutterwave and Paystack for payment solutions
- Claude AI for intelligent assistance
- Open source community

---

**Together, we can end hunger one donation at a time.** 🌱❤️
