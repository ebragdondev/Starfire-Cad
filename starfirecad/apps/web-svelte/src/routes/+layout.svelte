<script lang="ts">
  import '../app.css';
</script>

<div class="min-h-screen">
  <header class="p-4 border-b flex items-center justify-between">
    <div class="font-bold">StarfireCAD</div>
    <nav class="space-x-3 text-sm">
      <a href="/">Dashboard</a>
      <a href="/admin">Admin</a>
      <a href="/communities">Communities</a>
      <a href="/auth/login">Login</a>
    </nav>
  </header>
  <main class="p-4">
    <slot />
  </main>
</div>