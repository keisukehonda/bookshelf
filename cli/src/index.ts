#!/usr/bin/env tsx

import { Command } from "commander"
import { register } from "./register"
import { fetchFromNDL } from "./fetch"

const program = new Command()

program
  .name("bookshelf-cli")
  .description("Manage your book collection")
  .version("0.1.0")

program
  .command("register")
  .argument("<isbn>", "ISBN code to register")
  .description("Register a new ISBN to Supabase")
  .action(register)

program
  .command("fetch")
  .description("Fetch metadata from NDL API for pending ISBNs")
  .action(fetchFromNDL)

program.parse()
