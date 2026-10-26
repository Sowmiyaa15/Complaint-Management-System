package com.cms.util;

import com.cms.entity.*;
import com.cms.repository.ComplaintRepository;
import com.cms.repository.ComplaintUpdateRepository;
import com.cms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TestDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(TestDataInitializer.class);

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateRepository complaintUpdateRepository;
    private final PasswordEncoder passwordEncoder;

    public TestDataInitializer(UserRepository userRepository,
                               ComplaintRepository complaintRepository,
                               ComplaintUpdateRepository complaintUpdateRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.complaintUpdateRepository = complaintUpdateRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        logger.info("Checking and initializing test seed accounts...");

        // 1. Admin account
        User admin = userRepository.findByEmail("admin@example.com").orElseGet(() -> {
            User u = new User("admin@example.com", passwordEncoder.encode("Admin@123"), Role.ADMIN, "System Administrator", "+1-555-0100");
            return userRepository.save(u);
        });

        // 2. Employee 1
        User emp1 = userRepository.findByEmail("emp1@example.com").orElseGet(() -> {
            User u = new User("emp1@example.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, "John Support", "+1-555-0101");
            return userRepository.save(u);
        });

        // 3. Employee 2
        User emp2 = userRepository.findByEmail("emp2@example.com").orElseGet(() -> {
            User u = new User("emp2@example.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, "Sarah Inspector", "+1-555-0102");
            return userRepository.save(u);
        });

        // 4. Citizen 1
        User citizen1 = userRepository.findByEmail("citizen1@example.com").orElseGet(() -> {
            User u = new User("citizen1@example.com", passwordEncoder.encode("Citizen@123"), Role.CITIZEN, "Alice Citizen", "+1-555-0103");
            return userRepository.save(u);
        });

        // 5. Citizen 2
        User citizen2 = userRepository.findByEmail("citizen2@example.com").orElseGet(() -> {
            User u = new User("citizen2@example.com", passwordEncoder.encode("Citizen@123"), Role.CITIZEN, "Bob Resident", "+1-555-0104");
            return userRepository.save(u);
        });

        logger.info("Seed accounts verified.");

        // If complaints are empty, seed initial sample complaints
        if (complaintRepository.count() == 0) {
            logger.info("Seeding initial demo complaints...");

            // Complaint 1: PENDING
            Complaint c1 = new Complaint("Broken street light on 5th Ave", "The street light in front of house 42 has been flickering and is now completely out at night.", "Infrastructure", citizen1);
            c1.setStatus(ComplaintStatus.PENDING);
            c1.setSubmittedAt(LocalDateTime.now().minusDays(5));
            c1 = complaintRepository.save(c1);
            complaintUpdateRepository.save(new ComplaintUpdate(c1, citizen1, "Complaint registered", null, "PENDING", false));

            // Complaint 2: ASSIGNED
            Complaint c2 = new Complaint("Delayed water supply schedule", "Water supply has been disrupted for two days without prior municipal notice.", "Public Services", citizen1);
            c2.setStatus(ComplaintStatus.ASSIGNED);
            c2.setAssignedEmployee(emp1);
            c2.setSubmittedAt(LocalDateTime.now().minusDays(3));
            c2 = complaintRepository.save(c2);
            complaintUpdateRepository.save(new ComplaintUpdate(c2, citizen1, "Complaint registered", null, "PENDING", false));
            complaintUpdateRepository.save(new ComplaintUpdate(c2, admin, "Assigned to " + emp1.getName(), "PENDING", "ASSIGNED", false));

            // Complaint 3: IN_PROGRESS
            Complaint c3 = new Complaint("Pothole hazard on Main Street intersection", "Deep pothole causing vehicular damage and traffic slowdown during peak hours.", "Roads & Transportation", citizen2);
            c3.setStatus(ComplaintStatus.IN_PROGRESS);
            c3.setAssignedEmployee(emp2);
            c3.setSubmittedAt(LocalDateTime.now().minusDays(2));
            c3 = complaintRepository.save(c3);
            complaintUpdateRepository.save(new ComplaintUpdate(c3, citizen2, "Complaint registered", null, "PENDING", false));
            complaintUpdateRepository.save(new ComplaintUpdate(c3, admin, "Assigned to " + emp2.getName(), "PENDING", "ASSIGNED", false));
            complaintUpdateRepository.save(new ComplaintUpdate(c3, emp2, "Road inspection scheduled with maintenance crew", "ASSIGNED", "IN_PROGRESS", false));
            complaintUpdateRepository.save(new ComplaintUpdate(c3, emp2, "Internal note: Asphalt batch ordered from central depot", null, null, true));

            // Complaint 4: RESOLVED
            Complaint c4 = new Complaint("Garbage overflow at Park corner", "Recycling and waste bins near Elm Park are overflowing and need immediate collection.", "Sanitation", citizen2);
            c4.setStatus(ComplaintStatus.RESOLVED);
            c4.setAssignedEmployee(emp1);
            c4.setSubmittedAt(LocalDateTime.now().minusDays(4));
            c4.setResolvedAt(LocalDateTime.now().minusDays(1));
            c4 = complaintRepository.save(c4);
            complaintUpdateRepository.save(new ComplaintUpdate(c4, citizen2, "Complaint registered", null, "PENDING", false));
            complaintUpdateRepository.save(new ComplaintUpdate(c4, admin, "Assigned to " + emp1.getName(), "PENDING", "ASSIGNED", false));
            complaintUpdateRepository.save(new ComplaintUpdate(c4, emp1, "Waste collection truck dispatched and area sanitized", "ASSIGNED", "RESOLVED", false));

            logger.info("Demo complaints seeded successfully.");
        }
    }
}
