exports.getUsers = async (event) => {
    // Your logic to fetch users from the database
  
    // Replace with your actual function to fetch users
    const users = await fetchUsers();
  
    const response = {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  
    return response;
  };
  
  // Replace this with your actual function to fetch users from the database
  async function fetchUsers() {
    // Sample data
    return [
      {
        id: 1,
        name: 'John Doe',
        group: 'logistics',
      },
      {
        id: 2,
        name: 'Jane Smith',
        group: 'project_manager',
      },
    ];
  }
  