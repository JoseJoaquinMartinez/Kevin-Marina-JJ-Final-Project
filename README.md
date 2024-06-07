# MKJ-GYM

Gym web application

## Description
[ES]
La aplicación MKJ Gym permite a los usuarios obtener coaching personalizado y rutinas de entrenamiento personalizadas. Esta aplicación se enfoca en brindar un enfoque individualizado para cada usuario, adaptando los planes de entrenamiento a sus necesidades y objetivos específicos. Los entrenadores personales especializados en MKJ Gym trabajan en estrecha colaboración con los clientes para diseñar y supervisar programas de entrenamiento que aborden los objetivos de salud y bienestar físico de cada individuo, como la pérdida de peso, la mejora del rendimiento deportivo y la mejora general de la condición física <br>
[EN]
The MKJ Gym application allows users to get 1 on 1 coaching and personalized training routines. This app focuses on providing an individualized approach for each user, tailoring workout plans to their specific needs and goals. Specialized personal trainers at MKJ Gym work closely with clients to design and oversee training programs that address each individual's health and physical fitness objectives, such as weight loss, improvement of athletic performance, and overall fitness enhancement.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Backend Setup

1. **Clone the repository:**
    ```bash
    git clone https://github.com/JoseJoaquinMartinez/MKJ-GYM-Final-Project.git
    cd MKJ-GYM-Final-Project
    ```

2. **Install Python packages:**
    ```bash
    pipenv install
    ```

3. **Create a `.env` file:**
    ```bash
    cp .env.example .env
    ```

4. **Set up the database:**
    - Install your database engine (e.g., PostgreSQL).
    - Create your database and update the `DATABASE_URL` in the `.env` file.

5. **Run migrations:**
    ```bash
    pipenv run migrate
    pipenv run upgrade
    ```

6. **Start the backend server:**
    ```bash
    pipenv run start
    ```

### Frontend Setup

1. **Navigate to the frontend directory:**
    ```bash
    cd src
    ```

2. **Install Node.js packages:**
    ```bash
    npm install
    ```

3. **Start the frontend development server:**
    ```bash
    npm run start
    ```

## Usage

1. **Access the application:**
   Open your web browser and navigate to `http://localhost:3000`.

2. **Populate test users (optional):**
    ```bash
    flask insert-test-users 5
    ```

## Features

- Membership management
- Workout tracking
- User authentication
- Responsive design
- Schedule private training sessions with trainers
- View personalized workout routines
- Search and view detailed exercise instructions
- Watch instructional YouTube videos for exercises
- Find related exercises targeting the same muscle groups

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
