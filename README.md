Todo:

-[x] Home page Driving Summary stats fix
-[x] route details edit/delete button fix
-[x] csv export button
-[x] shadcn date picker
-[x] ip based geolocation for better reccomendations
-[x] auth
-[ ] minor ui fixes (places searchbar after deleting something, some icons not aligned properly, route details route map size)
-[ ] convert everything to km (maybe km/miles based on location)
-[ ] autofill start mileage
-[ ] route map map display
-[ ] SEO

Potential:

-[ ] places map zoom




Opt-In Feature:

Add a toggle for "Tax Deduction Tracking" in a new settings page.
Users can enable or disable the feature based on their needs.
Settings Page:

Create a settings page to house the toggle and other preferences (e.g., unit preferences, notifications, etc.).
Include additional settings to make the page more robust and useful.
Database Updates:

Add a tax_tracking_enabled column to the users table to store user preferences.
Add an is_first_trip column to the routes table to identify the first trip of the day.
Conditional Logic:

Update the dashboard and route details page to display tax tracking stats only if the feature is enabled.
Notification System:

Implement notifications for users who opt in, alerting them when they approach or reach 50 trips.
Task List Updates:

Update TASKS.md to reflect the new tasks for implementing the feature and settings page.