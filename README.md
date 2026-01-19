# DanceSuite

![License](https://img.shields.io/github/license/KertenKerem/DanceSuite)
![Bun](https://img.shields.io/badge/Bun-1.0+-black?logo=bun)
![CI Status](https://img.shields.io/github/actions/workflow/status/KertenKerem/DanceSuite/ci.yml?branch=main&label=CI%2FCD)

DanceSuite is a comprehensive, all-in-one management software for dance studios. It helps studio owners manage their classes, schedules, students, and billing with ease. ⚡ Powered by **Bun** for blazing-fast performance!

## Features

*   **Class & Schedule Management:** Easily create and manage classes, schedules, and rosters.
*   **Student Management:** Keep track of student information, attendance, and progress.
*   **Billing & Invoicing:** Automate invoicing and track payments.
*   **Reporting:** Generate reports on revenue, attendance, and more.
*   **Role-Based Access Control:** Secure access to different parts of the application based on user roles.
*   **Authentication & Authorization:** Secure JWT-based authentication with role-based permissions.
*   **RESTful API:** Well-documented API for all operations.
*   **Responsive Design:** Works seamlessly on desktop and mobile devices.
*   **⚡ Lightning Fast:** Built with Bun for ultra-fast runtime and package management.

## Technology Stack

### Frontend
- **Bun** (Runtime & Package Manager)
- React 18.3
- React Router
- Axios
- Vite

### Backend
- **Bun** (Runtime & Package Manager)
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/KertenKerem/DanceSuite.git
cd DanceSuite

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
```

### Manual Setup

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

## Prerequisites

*   **Bun** (v1.0 or higher) - [Install Bun](https://bun.sh)
*   PostgreSQL (v15 or higher)
*   Docker & Docker Compose (optional)

## Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/KertenKerem/DanceSuite.git
    cd DanceSuite
    ```

2.  Setup Backend
    ```sh
    cd backend
    bun install
    cp .env.example .env
    # Edit .env with your database credentials
    bunx prisma migrate dev
    bunx prisma generate
    bun run prisma:seed
    bun run dev
    ```

3.  Setup Frontend
    ```sh
    cd frontend
    bun install
    cp .env.example .env
    bun run dev
    ```

## Documentation

- [API Documentation](docs/API.md) - Complete API endpoint reference
- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Architecture Overview](docs/ARCHITECTURE.md) - System architecture and design

## Default Credentials

After running the database seed:

**Admin:**
- Email: admin@dancesuite.com
- Password: admin123

**Instructor:**
- Email: instructor@dancesuite.com
- Password: instructor123

**Student:**
- Email: student@dancesuite.com
- Password: student123

⚠️ **Change these in production!**

## Project Structure

```
DanceSuite/
├── backend/                # Express.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── index.js        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Database seeding
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── package.json
├── docs/                   # Documentation
├── .github/
│   └── workflows/          # CI/CD pipelines
└── docker-compose.yml      # Docker orchestration
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Support

For support, email support@dancesuite.com or open an issue on GitHub.

## Roadmap

- [ ] Email notifications
- [ ] Calendar integration
- [ ] Attendance tracking
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Payment gateway integration
- [ ] Automated invoicing
- [ ] Performance analytics
