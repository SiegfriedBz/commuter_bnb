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

ActiveRecord::Schema[7.0].define(version: 2023_06_29_164823) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

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

  create_table "favorites", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "flat_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["flat_id"], name: "index_favorites_on_flat_id"
    t.index ["user_id"], name: "index_favorites_on_user_id"
  end

  create_table "flats", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.text "description", null: false
    t.float "longitude"
    t.float "latitude"
    t.integer "price_per_night_in_cents", null: false
    t.boolean "available", default: true
    t.integer "category", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "street"
    t.string "city", null: false
    t.string "country", null: false
    t.index ["user_id"], name: "index_flats_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.string "content"
    t.bigint "author_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "flat_id", null: false
    t.bigint "recipient_id", null: false
    t.bigint "transaction_request_id"
    t.index ["author_id"], name: "index_messages_on_author_id"
    t.index ["flat_id"], name: "index_messages_on_flat_id"
    t.index ["recipient_id"], name: "index_messages_on_recipient_id"
    t.index ["transaction_request_id"], name: "index_messages_on_transaction_request_id"
  end

  create_table "payments", force: :cascade do |t|
    t.bigint "transaction_request_id", null: false
    t.bigint "payer_id", null: false
    t.bigint "payee_id", null: false
    t.integer "amount_in_cents", default: 0
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["payee_id"], name: "index_payments_on_payee_id"
    t.index ["payer_id"], name: "index_payments_on_payer_id"
    t.index ["transaction_request_id"], name: "index_payments_on_transaction_request_id"
  end

  create_table "reviews", force: :cascade do |t|
    t.text "content"
    t.integer "rating", default: 5, null: false
    t.bigint "reviewer_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "transaction_request_id", null: false
    t.bigint "flat_id", null: false
    t.index ["flat_id"], name: "index_reviews_on_flat_id"
    t.index ["reviewer_id"], name: "index_reviews_on_reviewer_id"
    t.index ["transaction_request_id"], name: "index_reviews_on_transaction_request_id"
  end

  create_table "transaction_requests", force: :cascade do |t|
    t.date "starting_date"
    t.date "ending_date"
    t.integer "exchange_price_per_night_in_cents"
    t.boolean "responder_agreed", default: false
    t.boolean "initiator_agreed", default: false
    t.bigint "responder_id", null: false
    t.bigint "initiator_id", null: false
    t.bigint "responder_flat_id", null: false
    t.bigint "initiator_flat_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "status", default: 0
    t.index ["initiator_flat_id"], name: "index_transaction_requests_on_initiator_flat_id"
    t.index ["initiator_id"], name: "index_transaction_requests_on_initiator_id"
    t.index ["responder_flat_id"], name: "index_transaction_requests_on_responder_flat_id"
    t.index ["responder_id"], name: "index_transaction_requests_on_responder_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "jti", null: false
    t.integer "role", default: 0
    t.text "description", default: ""
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "favorites", "flats"
  add_foreign_key "favorites", "users"
  add_foreign_key "flats", "users"
  add_foreign_key "messages", "flats"
  add_foreign_key "messages", "transaction_requests"
  add_foreign_key "messages", "users", column: "author_id"
  add_foreign_key "messages", "users", column: "recipient_id"
  add_foreign_key "payments", "transaction_requests"
  add_foreign_key "payments", "users", column: "payee_id"
  add_foreign_key "payments", "users", column: "payer_id"
  add_foreign_key "reviews", "flats"
  add_foreign_key "reviews", "transaction_requests"
  add_foreign_key "reviews", "users", column: "reviewer_id"
  add_foreign_key "transaction_requests", "flats", column: "initiator_flat_id"
  add_foreign_key "transaction_requests", "flats", column: "responder_flat_id"
  add_foreign_key "transaction_requests", "users", column: "initiator_id"
  add_foreign_key "transaction_requests", "users", column: "responder_id"
end
