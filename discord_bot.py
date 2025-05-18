import discord
from discord.ext import commands
import os
TOKEN = os.getenv('DISCORD_BOT_TOKEN', 'token')
bot = commands.Bot(command_prefix='/')

@bot.event
async def on_ready():
    print(f'{bot.user} has connected.')

@bot.command()
async def panic(ctx, unit: str):
    await ctx.send(f'Panic alert from {unit}')

bot.run(TOKEN)
