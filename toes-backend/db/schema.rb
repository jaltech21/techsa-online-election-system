# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_03_30_022159) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "admin_users", force: :cascade do |t|
    t.string "username", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["username"], name: "index_admin_users_on_username", unique: true
  end

  create_table "announcements", force: :cascade do |t|
    t.string "title", null: false
    t.text "body", null: false
    t.bigint "election_id"
    t.integer "admin_user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_announcements_on_created_at"
    t.index ["election_id"], name: "index_announcements_on_election_id"
  end

  create_table "candidates", force: :cascade do |t|
    t.string "name", null: false
    t.string "position", null: false
    t.text "bio"
    t.text "manifesto"
    t.bigint "election_id", null: false
    t.bigint "registration_key_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "video_url"
    t.index ["election_id"], name: "index_candidates_on_election_id"
    t.index ["registration_key_id"], name: "index_candidates_on_registration_key_id", unique: true
  end

  create_table "chat_messages", force: :cascade do |t|
    t.text "body", null: false
    t.integer "user_id", null: false
    t.string "user_type", null: false
    t.bigint "election_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["election_id"], name: "index_chat_messages_on_election_id"
    t.index ["user_type", "user_id"], name: "index_chat_messages_on_user_type_and_user_id"
  end

  create_table "elections", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.integer "status", default: 0, null: false
    t.datetime "starts_at"
    t.datetime "ends_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "questions", force: :cascade do |t|
    t.text "body", null: false
    t.bigint "student_id", null: false
    t.bigint "candidate_id", null: false
    t.text "answer"
    t.boolean "answered", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "pinned"
    t.index ["candidate_id"], name: "index_questions_on_candidate_id"
    t.index ["student_id"], name: "index_questions_on_student_id"
  end

  create_table "registration_keys", force: :cascade do |t|
    t.string "token", null: false
    t.boolean "used", default: false, null: false
    t.bigint "election_id", null: false
    t.integer "candidate_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["election_id"], name: "index_registration_keys_on_election_id"
    t.index ["token"], name: "index_registration_keys_on_token", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "student_id", null: false
    t.string "name", null: false
    t.string "email"
    t.string "password_digest", null: false
    t.boolean "has_voted", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["student_id"], name: "index_users_on_student_id", unique: true
  end

  create_table "votes", force: :cascade do |t|
    t.bigint "voter_id", null: false
    t.bigint "candidate_id", null: false
    t.bigint "election_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "reference"
    t.index ["candidate_id"], name: "index_votes_on_candidate_id"
    t.index ["election_id"], name: "index_votes_on_election_id"
    t.index ["voter_id", "election_id"], name: "index_votes_on_voter_id_and_election_id", unique: true
    t.index ["voter_id"], name: "index_votes_on_voter_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "announcements", "elections"
  add_foreign_key "candidates", "elections"
  add_foreign_key "candidates", "registration_keys"
  add_foreign_key "chat_messages", "elections"
  add_foreign_key "questions", "candidates"
  add_foreign_key "questions", "users", column: "student_id"
  add_foreign_key "registration_keys", "elections"
  add_foreign_key "votes", "candidates"
  add_foreign_key "votes", "elections"
  add_foreign_key "votes", "users", column: "voter_id"
end
