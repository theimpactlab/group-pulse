const fs = require("fs")
const path = require("path")

// Function to recursively search for files
function findFiles(dir, pattern) {
  let results = []

  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      results = results.concat(findFiles(filePath, pattern))
    } else if (pattern.test(file)) {
      // Add matching files to results
      results.push(filePath)
    }
  }

  return results
}

// Find all dynamic route files
const appDir = path.join(process.cwd(), "app")
const dynamicRoutePattern = /\[\w+\]/

console.log("Searching for dynamic routes...")
const dynamicRouteFiles = findFiles(appDir, dynamicRoutePattern)

// Group routes by their path pattern
const routeGroups = {}

dynamicRouteFiles.forEach((file) => {
  // Extract the route path relative to app directory
  const relativePath = path.relative(appDir, file)

  // Replace the parameter name with a placeholder to group similar routes
  const routePattern = relativePath.replace(/\[(\w+)\]/g, "[PARAM]")

  if (!routeGroups[routePattern]) {
    routeGroups[routePattern] = []
  }

  routeGroups[routePattern].push({
    file,
    paramName: relativePath.match(/\[(\w+)\]/)?.[1],
  })
})

// Find conflicts (routes with the same pattern but different parameter names)
console.log("\nChecking for conflicts...")
let hasConflicts = false

Object.entries(routeGroups).forEach(([pattern, routes]) => {
  if (routes.length > 1) {
    const paramNames = new Set(routes.map((r) => r.paramName))

    if (paramNames.size > 1) {
      console.log(`\n⚠️ CONFLICT FOUND in route pattern: ${pattern}`)
      console.log("Files with conflicting parameter names:")

      routes.forEach((route) => {
        console.log(`- ${route.file} (param: [${route.paramName}])`)
      })

      hasConflicts = true
    }
  }
})

if (!hasConflicts) {
  console.log("✅ No conflicts found!")
} else {
  console.log("\n⚠️ Conflicts found! Fix the parameter names to be consistent across similar routes.")
}
